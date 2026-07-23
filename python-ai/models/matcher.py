import math
from typing import List, Optional

import numpy as np

from api.schemas import MatchRequest, MatchResponse
from models.explainability import analyze_skills

# --- Lazy-loaded SBERT model ---
_sbert_model = None
_SBERT_MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"


def _get_sbert_model():
    """Lazily load the SBERT sentence-transformer model on first call."""
    global _sbert_model
    if _sbert_model is None:
        from sentence_transformers import SentenceTransformer
        _sbert_model = SentenceTransformer(_SBERT_MODEL_NAME)
    return _sbert_model


def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate 384-dimensional SBERT embeddings for a list of texts.

    Args:
        texts: List of input strings to embed.

    Returns:
        List of 384-dimensional float vectors.
    """
    model = _get_sbert_model()
    embeddings = model.encode(texts, normalize_embeddings=True)
    return [emb.tolist() for emb in embeddings]


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity between two equal-length vectors.

    Args:
        a: First vector.
        b: Second vector.

    Returns:
        Cosine similarity as a float in [-1, 1].
    """
    dot_product = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)


# --- Random Forest classifier (fitted on dummy data) ---
_rf_model: Optional[object] = None


def _get_rf_model():
    """Lazily create and fit a dummy RandomForestClassifier.

    The model is trained on synthetic data so it produces plausible
    suitability scores.  If scikit-learn is unavailable a weighted
    heuristic fallback is used instead.
    """
    global _rf_model
    if _rf_model is not None:
        return _rf_model

    try:
        from sklearn.ensemble import RandomForestClassifier

        # Build a small synthetic training set
        X: List[List[float]] = []
        y: List[int] = []

        for sim in np.linspace(0, 1, 11):
            for skill_ratio in np.linspace(0, 1, 11):
                for exp in [0, 2, 5, 8, 10, 12, 15]:
                    features = [sim, skill_ratio, min(exp / 10, 1.0)]
                    # Label: 1 (suitable) when the heuristic score >= 60
                    heuristic = (sim * 0.4 + skill_ratio * 0.4 + min(exp / 10, 1) * 0.2) * 100
                    X.append(features)
                    y.append(1 if heuristic >= 60 else 0)

        clf = RandomForestClassifier(n_estimators=50, max_depth=6, random_state=42)
        clf.fit(X, y)
        _rf_model = ("rf", clf)
    except Exception:
        _rf_model = ("heuristic", None)

    return _rf_model


def predict_suitability(
    similarity: float,
    skill_match_ratio: float,
    experience_years: float,
) -> float:
    """Predict a 0-100 suitability score.

    Uses a pre-fitted RandomForestClassifier when available; otherwise
    falls back to a deterministic weighted heuristic formula.

    Args:
        similarity: Cosine similarity between resume and job description (0-1).
        skill_match_ratio: Fraction of required skills present in applicant (0-1).
        experience_years: Total years of relevant experience.

    Returns:
        Suitability score from 0 to 100, rounded to 1 decimal place.
    """
    exp_factor = min(experience_years / 10, 1.0)
    features = [[similarity, skill_match_ratio, exp_factor]]

    kind, clf = _get_rf_model()

    if kind == "rf" and clf is not None:
        # Use the RF probability of the positive class, scaled to 0-100
        proba = clf.predict_proba(features)[0][1]  # probability of class 1
        score = float(proba) * 100
    else:
        # Weighted heuristic fallback
        score = (similarity * 0.4 + skill_match_ratio * 0.4 + exp_factor * 0.2) * 100

    return round(max(0.0, min(100.0, score)), 1)


def match_candidate(request: MatchRequest) -> MatchResponse:
    """Run the full candidate-matching pipeline.

    Steps:
        1. Generate SBERT embeddings for resume and job description.
        2. Compute cosine similarity.
        3. Analyse skill overlap.
        4. Predict an overall suitability score.
        5. Build a human-readable explanation.

    Args:
        request: Validated MatchRequest payload.

    Returns:
        MatchResponse with scores, skill lists, and explanation.
    """
    # --- Semantic similarity via SBERT ---
    try:
        embeddings = generate_embeddings([request.resume_text, request.job_description])
        sim_score = cosine_similarity(embeddings[0], embeddings[1])
    except Exception:
        # Fallback to a basic overlap heuristic if SBERT fails
        sim_score = _basic_text_overlap(request.resume_text, request.job_description)

    # --- Skill analysis ---
    matched_skills, missing_skills, skill_explanation = analyze_skills(
        applicant_skills=request.applicant_skills,
        required_skills=request.required_skills,
    )

    skill_match_ratio = (
        len(matched_skills) / len(request.required_skills)
        if request.required_skills
        else 1.0
    )

    # --- Suitability prediction ---
    suitability = predict_suitability(
        similarity=sim_score,
        skill_match_ratio=skill_match_ratio,
        experience_years=request.experience_years or 0,
    )

    # --- Build explanation ---
    explanation = (
        f"Semantic similarity: {sim_score:.2f}. "
        f"{skill_explanation} "
        f"Experience: {request.experience_years or 0} years. "
        f"Overall suitability: {suitability}/100."
    )

    return MatchResponse(
        suitability_score=suitability,
        similarity_score=round(sim_score, 4),
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        explanation=explanation,
    )


def _basic_text_overlap(text_a: str, text_b: str) -> float:
    """Simple word-overlap fallback when SBERT is unavailable.

    Args:
        text_a: First text.
        text_b: Second text.

    Returns:
        Jaccard-like similarity score between 0 and 1.
    """
    words_a = set(text_a.lower().split())
    words_b = set(text_b.lower().split())
    if not words_a or not words_b:
        return 0.0
    intersection = words_a & words_b
    union = words_a | words_b
    return len(intersection) / len(union)
