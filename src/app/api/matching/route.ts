import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { jobOrderId } = await request.json();

    const jobOrder = await db.jobOrder.findUnique({ where: { id: jobOrderId } });
    if (!jobOrder) {
      return NextResponse.json({ error: 'Job order not found' }, { status: 404 });
    }

    // Get all applicant profiles
    const profiles = await db.applicantProfile.findMany({
      include: { skills: true, languages: true, experience: true },
    });

    // Placeholder SBERT matching - will be replaced with real algorithm
    const scored = profiles.map((profile) => {
      let score = 50; // base score

      // Country preference match
      if (profile.preferredCountry === jobOrder.country) score += 15;

      // Job category match
      if (profile.preferredJobCategory === jobOrder.jobCategory) score += 20;

      // Salary range match
      if (profile.salaryExpectation) {
        if (jobOrder.salaryMin && profile.salaryExpectation <= jobOrder.salaryMax! + 100) {
          score += 10;
        }
      }

      // Skills match bonus
      const relevantSkills = profile.skills.filter(s => {
        const category = s.category;
        return category === 'childcare' || category === 'cooking' || category === 'housekeeping' || category === 'elderly_care';
      }).length;
      score += Math.min(relevantSkills * 3, 15);

      // Cap at 99
      score = Math.min(Math.round(score), 99);

      return {
        profileId: profile.id,
        applicantId: profile.userId,
        name: `${profile.firstName} ${profile.lastName}`,
        score,
        matchDetails: {
          countryMatch: profile.preferredCountry === jobOrder.country,
          categoryMatch: profile.preferredJobCategory === jobOrder.jobCategory,
          skillCount: relevantSkills,
        },
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return NextResponse.json(scored);
  } catch (error) {
    console.error('Matching error:', error);
    return NextResponse.json({ error: 'Matching failed' }, { status: 500 });
  }
}