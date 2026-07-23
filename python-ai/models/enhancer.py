"""Rule-based resume enhancement module.

This module applies formatting and optimisation rules to an existing resume
text without inventing fake experiences or qualifications.
"""

import re
from typing import List

from api.schemas import EnhanceRequest, EnhanceResponse


# Common section header patterns (lowercase, for detection)
_SECTION_HEADERS = [
    "professional summary",
    "summary",
    "objective",
    "experience",
    "work experience",
    "professional experience",
    "education",
    "skills",
    "technical skills",
    "certifications",
    "projects",
    "awards",
    "languages",
    "references",
]


def _extract_key_terms(job_description: str) -> List[str]:
    """Extract significant terms from a job description.

    Uses a simple frequency-based approach: split into words,
    filter out very short words and common stop words, then
    return the most relevant unique terms.

    Args:
        job_description: The full job posting text.

    Returns:
        A list of key terms (lowercased) found in the description.
    """
    stop_words = {
        "the", "and", "for", "are", "but", "not", "you", "all",
        "can", "had", "her", "was", "one", "our", "out", "has",
        "have", "from", "been", "some", "them", "than", "its",
        "over", "that", "this", "with", "will", "each", "make",
        "like", "into", "many", "then", "they", "what", "about",
        "which", "when", "their", "would", "there", "these", "other",
        "should", "could", "being", "where", "after", "those", "also",
        "able", "must", "may", "well", "work", "role", "team",
        "job", "company", "position", "candidate", "looking",
        "join", "we", "who", "new", "years", "experience",
    }

    words = re.findall(r"\b[a-zA-Z]{3,}\b", job_description.lower())
    freq: dict[str, int] = {}
    for w in words:
        if w not in stop_words:
            freq[w] = freq.get(w, 0) + 1

    key_terms = sorted(
        [w for w, c in freq.items() if c >= 2],
        key=lambda w: freq[w],
        reverse=True,
    )
    return key_terms[:30]


def _capitalize_section_headers(text: str) -> tuple[str, List[str]]:
    """Ensure section headers are consistently title-cased.

    Args:
        text: The resume text.

    Returns:
        Tuple of (modified text, list of changes made).
    """
    changes: List[str] = []
    lines = text.split("\n")
    new_lines: List[str] = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            new_lines.append(line)
            continue

        lowered = stripped.lower().rstrip(":")
        matched_header = None
        for header in _SECTION_HEADERS:
            if lowered == header or lowered == header + ":":
                matched_header = header
                break

        if matched_header:
            formatted = matched_header.title()
            if stripped.endswith(":"):
                formatted += ":"
            leading = line[: len(line) - len(line.lstrip())]
            new_line = leading + formatted
            if new_line != line:
                changes.append(f"Capitalised section header: \"{stripped}\" -> \"{formatted}\"")
            new_lines.append(new_line)
        else:
            new_lines.append(line)

    return "\n".join(new_lines), changes


def _normalize_bullets(text: str) -> tuple[str, List[str]]:
    """Standardise bullet point formatting.

    Converts various bullet styles to a consistent bullet prefix.

    Args:
        text: The resume text.

    Returns:
        Tuple of (modified text, list of changes made).
    """
    changes: List[str] = []
    lines = text.split("\n")
    new_lines: List[str] = []
    changed_count = 0

    bullet_pattern = re.compile(r"^(\s*)([-*])\s+")

    for line in lines:
        match = bullet_pattern.match(line)
        if match:
            indent = match.group(1)
            rest = line[match.end():]
            new_line = f"{indent}* {rest}"
            if new_line != line:
                changed_count += 1
            new_lines.append(new_line)
        else:
            new_lines.append(line)

    if changed_count > 0:
        changes.append(f"Standardised {changed_count} bullet point(s) to consistent format")

    return "\n".join(new_lines), changes


def _ensure_professional_summary(
    resume_text: str, job_description: str, changes: List[str]
) -> str:
    """Add a Professional Summary section at the top if one is missing.

    The summary is generated from existing skills and experience found
    in the resume -- no hallucinated content.

    Args:
        resume_text: The current resume text.
        job_description: The job description.
        changes: Accumulator list for change descriptions.

    Returns:
        Resume text with a Professional Summary prepended if needed.
    """
    lines = resume_text.split("\n")
    first_significant_lines: List[str] = []

    for line in lines:
        stripped = line.strip()
        if stripped:
            first_significant_lines.append(stripped.lower())
        if len(first_significant_lines) >= 10:
            break

    for content in first_significant_lines:
        normalized = content.lower().rstrip(":")
        if normalized in ("professional summary", "summary", "objective"):
            return resume_text

    # Extract skills from the resume
    skills_section_started = False
    resume_skills: List[str] = []
    for line in lines:
        lowered = line.strip().lower()
        if "skill" in lowered:
            skills_section_started = True
            continue
        if skills_section_started:
            if not lowered or any(h in lowered for h in ["experience", "education", "project"]):
                break
            items = re.split(r"[,;|]", line)
            for item in items:
                item = item.strip()
                if 2 < len(item) < 50 and item.lower() not in {
                    s.lower() for s in resume_skills
                }:
                    resume_skills.append(item)

    exp_match = re.search(
        r"(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)",
        resume_text,
        re.IGNORECASE,
    )
    exp_str = ""
    if exp_match:
        exp_str = f" with {exp_match.group(0)}"

    if resume_skills:
        top_skills = resume_skills[:5]
        skill_str = ", ".join(top_skills)
        if len(resume_skills) > 5:
            skill_str += ", and more"
        summary = (
            f"Professional Summary:\n"
            f"Experienced professional{exp_str} with expertise in {skill_str}. "
            f"Committed to delivering high-quality results.\n"
        )
    elif exp_str:
        summary = (
            f"Professional Summary:\n"
            f"Dedicated professional{exp_str} seeking new challenges "
            f"and opportunities for growth.\n"
        )
    else:
        summary = (
            f"Professional Summary:\n"
            f"Motivated professional with a track record of achievement, "
            f"eager to contribute to team success.\n"
        )

    changes.append("Added Professional Summary section at the top of the resume")
    return summary + "\n" + resume_text


def _check_key_term_presence(
    resume_text: str, key_terms: List[str], changes: List[str]
) -> None:
    """Check which key job-description terms appear in the resume.

    This is informational only -- we do NOT inject missing terms.

    Args:
        resume_text: The resume text.
        key_terms: Key terms from the job description.
        changes: Accumulator list for informational notes.
    """
    resume_lower = resume_text.lower()
    missing_terms: List[str] = []
    for term in key_terms:
        if term not in resume_lower:
            missing_terms.append(term)

    if missing_terms:
        sample = missing_terms[:8]
        changes.append(
            f"Key job terms not found in resume (consider adding if applicable): "
            f"{', '.join(sample)}"
            + (f" (+{len(missing_terms) - 8} more)" if len(missing_terms) > 8 else "")
        )
    else:
        changes.append("All key job description terms are present in the resume")


def enhance_resume(request: EnhanceRequest) -> EnhanceResponse:
    """Apply rule-based enhancements to a resume text.

    Enhancements applied (in order):
        1. Capitalise section headers consistently.
        2. Normalise bullet point formatting.
        3. Check for key terms from the job description.
        4. Add a Professional Summary if one is missing.

    IMPORTANT: This function does NOT invent fake experiences or
    qualifications. It only reformats and optimises existing content.

    Args:
        request: Validated EnhanceRequest payload.

    Returns:
        EnhanceResponse with the enhanced text and a list of changes.
    """
    text = request.resume_text
    all_changes: List[str] = []

    # 1. Capitalize section headers
    text, header_changes = _capitalize_section_headers(text)
    all_changes.extend(header_changes)

    # 2. Normalize bullet points
    text, bullet_changes = _normalize_bullets(text)
    all_changes.extend(bullet_changes)

    # 3. Extract key terms from job description and check presence
    key_terms = _extract_key_terms(request.job_description)
    if key_terms:
        _check_key_term_presence(text, key_terms, all_changes)

    # 4. Add Professional Summary if missing
    text = _ensure_professional_summary(text, request.job_description, all_changes)

    if not all_changes:
        all_changes.append("No changes were needed -- the resume looks well-formatted.")

    return EnhanceResponse(
        enhanced_resume=text.strip(),
        changes_summary=all_changes,
    )
