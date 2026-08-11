import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireFira } from '@/lib/auth'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

function computeFallbackScore(applicantSkills: string[], requiredSkills: string[]) {
  const reqLower = requiredSkills.map((s: string) => s.toLowerCase())
  const appLower = applicantSkills.map((s: string) => s.toLowerCase())
  const matched = applicantSkills.filter((s: string) => reqLower.includes(s.toLowerCase()))
  const missing = requiredSkills.filter((s: string) => !appLower.includes(s.toLowerCase()))
  const ratio = requiredSkills.length > 0 ? matched.length / requiredSkills.length : 0.5
  const semantic = ratio * 0.8 + 0.15
  const matchScore = Math.round((semantic * 0.7 + ratio * 0.3) * 100 * 10) / 10

  let explanation: string
  if (ratio >= 0.8) explanation = `Excellent match. ${matched.length}/${requiredSkills.length} required skills present.`
  else if (ratio >= 0.5) explanation = `Good match. ${matched.length}/${requiredSkills.length} required skills. Missing: ${missing.join(', ') || 'minor gaps'}.`
  else explanation = `Partial match. ${matched.length}/${requiredSkills.length} required skills. Missing key competencies: ${missing.join(', ') || 'multiple areas'}.`

  return { matchScore: Math.min(matchScore, 99), semanticScore: semantic, matchedSkills: matched, missingSkills: missing, explanation }
}

export async function POST(request: NextRequest) {
  const auth = requireFira(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { jobOrderId } = body
    if (!jobOrderId) return NextResponse.json({ error: 'jobOrderId required' }, { status: 400 })

    const job = await db.jobOrder.findUnique({ where: { id: jobOrderId } })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    let requiredSkills: string[] = []
    try { requiredSkills = JSON.parse(job.requiredSkills) } catch { requiredSkills = job.requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean) }

    const applicants = await db.user.findMany({
      where: { role: 'applicant', isActive: true, isApproved: true },
      include: { applicantProfile: { include: { skills: true, experience: true, education: true } } },
    })

    const results = []
    for (const applicant of applicants) {
      const profile = applicant.applicantProfile
      if (!profile) continue

      const resumeText = profile.resumeText || ''
      const yearsExp = profile.yearsExperience || 0
      const applicantSkills = profile.skills.map((s: any) => s.name)

      let analysis: any
      try {
        const aiRes = await fetch(`${AI_SERVICE_URL}/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resume_text: resumeText, job_description: job.description, applicant_skills: applicantSkills, required_skills: requiredSkills, experience_years: yearsExp }),
          signal: AbortSignal.timeout(5000),
        })
        if (aiRes.ok) {
          const aiData = await aiRes.json()
          analysis = { matchScore: aiData.suitability_score, semanticScore: aiData.similarity_score, matchedSkills: aiData.matched_skills || [], missingSkills: aiData.missing_skills || [], explanation: aiData.explanation || '' }
        } else {
          analysis = computeFallbackScore(applicantSkills, requiredSkills)
        }
      } catch {
        analysis = computeFallbackScore(applicantSkills, requiredSkills)
      }

      const existingApp = await db.application.findUnique({ where: { applicantId_jobOrderId: { applicantId: applicant.id, jobOrderId } } })
      if (existingApp) {
        await db.aIAnalysisResult.upsert({
          where: { applicationId: existingApp.id },
          create: { applicationId: existingApp.id, matchScore: analysis.matchScore, semanticScore: analysis.semanticScore, matchedSkills: JSON.stringify(analysis.matchedSkills), missingSkills: JSON.stringify(analysis.missingSkills), explanation: analysis.explanation },
          update: { matchScore: analysis.matchScore, semanticScore: analysis.semanticScore, matchedSkills: JSON.stringify(analysis.matchedSkills), missingSkills: JSON.stringify(analysis.missingSkills), explanation: analysis.explanation },
        })
        await db.application.update({ where: { id: existingApp.id }, data: { matchScore: analysis.matchScore } })
      }

      results.push({ applicantId: applicant.id, applicantName: applicant.name, skills: applicantSkills, experienceYears: yearsExp, matchScore: analysis.matchScore, semanticScore: analysis.semanticScore, matchedSkills: analysis.matchedSkills, missingSkills: analysis.missingSkills, explanation: analysis.explanation, hasApplication: !!existingApp, applicationId: existingApp?.id })
    }

    results.sort((a, b) => b.matchScore - a.matchScore)
    return NextResponse.json({ candidates: results, jobId: jobOrderId })
  } catch (error) {
    console.error('Matching error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
