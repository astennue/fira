"""Skill comparison and explanation generation utilities."""

from typing import List, Tuple


def analyze_skills(
    applicant_skills: List[str],
    required_skills: List[str],
) -> Tuple[List[str], List[str], str]:
    """Compare applicant skills against required skills (case-insensitive).

    Args:
        applicant_skills: Skills listed on the applicant's resume.
        required_skills: Skills required by the job posting.

    Returns:
        A tuple of (matched_skills, missing_skills, explanation_text).
    """
    # Normalise to lowercase for comparison
    applicant_lower = {s.strip().lower() for s in applicant_skills if s.strip()}
    required_lower = {s.strip().lower() for s in required_skills if s.strip()}

    # Use original casing from required_skills for the output lists
    required_map = {s.strip().lower(): s.strip() for s in required_skills if s.strip()}

    matched: List[str] = []
    missing: List[str] = []

    for skill_lower in required_lower:
        if skill_lower in applicant_lower:
            matched.append(required_map[skill_lower])
        else:
            missing.append(required_map[skill_lower])

    # Build explanation
    total = len(required_skills)
    if total == 0:
        explanation = "No required skills were specified for this position."
    else:
        pct = len(matched) / total * 100
        if pct == 100:
            explanation = (
                f"All {total} required skills are matched. "
                "The candidate meets the full skill requirements."
            )
        elif pct >= 70:
            explanation = (
                f"{len(matched)} out of {total} required skills are matched ({pct:.0f}%). "
                f"Strong skill alignment. Missing: {', '.join(missing)}."
            )
        elif pct >= 40:
            explanation = (
                f"{len(matched)} out of {total} required skills are matched ({pct:.0f}%). "
                f"Moderate skill alignment. Missing: {', '.join(missing)}."
            )
        else:
            explanation = (
                f"Only {len(matched)} out of {total} required skills are matched ({pct:.0f}%). "
                f"Significant skill gaps. Missing: {', '.join(missing)}."
            )

    return matched, missing, explanation
