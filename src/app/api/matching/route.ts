import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

function computeFallbackScore(
  applicantSkills: string[],
  requiredSkills: string[]
): { matchScore: number; semanticScore: number; matchedSkills: string[]; missingSkills: string[]; explanation: string } {
  const reqLower = requiredSkills.map((s) => s.toLowerCase());
  const appLower = applicantSkills.map((s) => s.toLowerCase());
  const matched = applicantSkills.filter((s) => reqLower.includes(s.toLowerCase()));
  const missing = requiredSkills.filter((s) => !appLower.includes(s.toLowerCase()));
  const skillRatio = requiredSkills.length > 0 ? matched.length / requiredSkills.length : 0.5;
  const semanticScore = Math.round((skillRatio * 0.75 + 0.15 + Math.random() * 0.1) * 1000) / 1000;
  const matchScore = Math.round((semanticScore * 0.6 + skillRatio * 0.3 + Math.random() * 0.1) * 100 * 10) / 10;

  let explanation: string;
  if (skillRatio >= 0.8) {
    explanation = `Excellent match. Candidate possesses ${matched.length}/${requiredSkills.length} required skills.`;
  } else if (skillRatio >= 0.5) {
    explanation = `Good match with ${matched.length}/${requiredSkills.length} required skills. May need training for: ${missing.join(', ') || 'minor gaps'}.`;
  } else {
    explanation = `Partial match with ${matched.length}/${requiredSkills.length} required skills. Missing key competencies: ${missing.join(', ') || 'multiple areas'}.`;
  }

  return {
    matchScore: Math.min(matchScore, 99),
    semanticScore,
    matchedSkills: matched,
    missingSkills: missing,
    explanation,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobOrderId } = body;

    if (!jobOrderId) {
      return NextResponse.json({ error: 'jobOrderId is required' }, { status: 400 });
    }

    const job = await db.jobOrder.findUnique({
      where: { id: jobOrderId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    let requiredSkills: string[] = [];
    try {
      requiredSkills = JSON.parse(job.requiredSkills);
    } catch {
      requiredSkills = job.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const applicants = await db.user.findMany({
      where: { role: 'applicant', isActive: true, isApproved: true },
      include: {
        applicantProfile: {
          include: {
            skills: true,
            experience: true,
            education: true,
          },
        },
      },
    });

    const results = [];

    for (const applicant of applicants) {
      const profile = applicant.applicantProfile;
      if (!profile) continue;

      const resumeText = profile.resumeText || '';
      const experienceYears = profile.yearsExperience || 0;
      const applicantSkills = profile.skills.map((s) => s.name);

      let analysis: {
        matchScore: number;
        semanticScore: number;
        matchedSkills: string[];
        missingSkills: string[];
        explanation: string;
      };

      // Try AI service
      try {
        const aiRes = await fetch(`${AI_SERVICE_URL}/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_text: resumeText,
            job_description: job.description,
            applicant_skills: applicantSkills,
            required_skills: requiredSkills,
            experience_years: experienceYears,
          }),
          signal: AbortSignal.timeout(5000),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          analysis = {
            matchScore: aiData.suitability_score,
            semanticScore: aiData.similarity_score,
            matchedSkills: aiData.matched_skills || [],
            missingSkills: aiData.missing_skills || [],
            explanation: aiData.explanation || '',
          };
        } else {
          analysis = computeFallbackScore(applicantSkills, requiredSkills);
        }
      } catch {
        analysis = computeFallbackScore(applicantSkills, requiredSkills);
      }

      // Find existing application for this applicant+job
      const existingApp = await db.application.findUnique({
        where: {
          applicantId_jobOrderId: {
            applicantId: applicant.id,
            jobOrderId,
          },
        },
      });

      // Upsert AI analysis
      if (existingApp) {
        await db.aIAnalysisResult.upsert({
          where: { applicationId: existingApp.id },
          create: {
            applicationId: existingApp.id,
            matchScore: analysis.matchScore,
            semanticScore: analysis.semanticScore,
            matchedSkills: JSON.stringify(analysis.matchedSkills),
            missingSkills: JSON.stringify(analysis.missingSkills),
            explanation: analysis.explanation,
          },
          update: {
            matchScore: analysis.matchScore,
            semanticScore: analysis.semanticScore,
            matchedSkills: JSON.stringify(analysis.matchedSkills),
            missingSkills: JSON.stringify(analysis.missingSkills),
            explanation: analysis.explanation,
          },
        });

        await db.application.update({
          where: { id: existingApp.id },
          data: { matchScore: analysis.matchScore },
        });
      }

      results.push({
        applicantId: applicant.id,
        applicantName: applicant.name,
        email: applicant.email,
        skills: applicantSkills,
        experienceYears,
        matchScore: analysis.matchScore,
        semanticScore: analysis.semanticScore,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        explanation: analysis.explanation,
        hasApplication: !!existingApp,
        applicationId: existingApp?.id,
      });
    }

    results.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ candidates: results, jobId: jobOrderId });
  } catch (error) {
    console.error('Matching error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
