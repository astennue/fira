/**
 * MatchWise — simulated AI match engine (prototype).
 * Deterministic per (userId, jobId) so scores stay stable across renders.
 * Weighting mirrors the platform blueprint: 0.40 semantic + 0.40 skills + 0.20 experience.
 */

export interface MatchBreakdown {
  score: number            // 0-100 overall
  semanticPct: number      // 0-100 semantic fit
  skillsPct: number        // 0-100 skills overlap
  experiencePct: number    // 0-100 experience alignment
  matchedSkills: string[]
  missingSkills: string[]
  why: string[]
}

/** Stable string hash → 0..1 */
function hash01(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

const SKILL_POOL = [
  'Household management', 'Cooking', 'Child care', 'Elderly care', 'First aid',
  'Patient care', 'Customer service', 'Electronics assembly', 'Quality control',
  'Medication management', 'IV therapy', 'Patient assessment', 'Food service',
  'Housekeeping', 'Teamwork',
]

export function simulateMatch(
  jobId: string,
  userSeed: string,
  requiredSkills: string[] = [],
): MatchBreakdown {
  const base = hash01(`${userSeed}::${jobId}`)
  const semantic = 55 + Math.round(base * 42)          // 55-97
  const skills = 52 + Math.round(hash01(`${jobId}::${userSeed}::s`) * 45)   // 52-97
  const experience = 58 + Math.round(hash01(`exp::${userSeed}::${jobId}`) * 40) // 58-98

  const score = Math.min(
    99,
    Math.round(semantic * 0.4 + skills * 0.4 + experience * 0.2),
  )

  const req = requiredSkills.length > 0 ? requiredSkills : SKILL_POOL.slice(0, 4)
  const matchedCount = Math.max(1, Math.round((skills / 100) * req.length))
  const matchedSkills = req.slice(0, matchedCount)
  const missingSkills = req.slice(matchedCount)

  const why: string[] = [
    `${matchedSkills.length}/${req.length} required skills present on your profile.`,
    semantic >= 80
      ? 'Strong semantic alignment between your resume and this job description.'
      : semantic >= 65
        ? 'Good overall alignment with the role description.'
        : 'Partial alignment — consider tailoring your resume keywords.',
    experience >= 80
      ? 'Your years of experience exceed the typical requirement.'
      : 'Your experience level is in the expected range for this role.',
  ]
  if (missingSkills.length > 0) {
    why.push(`Missing: ${missingSkills.slice(0, 2).join(', ')} — AI Resume Boost can help.`)
  }

  return { score, semanticPct: semantic, skillsPct: skills, experiencePct: experience, matchedSkills, missingSkills, why }
}
