import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_ATS_STAGES, STAGE_COLORS } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const agencyId = searchParams.get('agencyId');
    const employerId = searchParams.get('employerId');

    const where: Record<string, unknown> = {};

    if (country) where.country = country;
    if (category) where.jobCategory = category;
    if (status) where.status = status;
    if (agencyId) where.agencyId = agencyId;
    if (employerId) where.employerId = employerId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const jobs = await db.jobOrder.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        employer: { select: { companyName: true, country: true } },
        agency: { select: { name: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Jobs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, country, jobCategory, salaryMin, salaryMax, currency, contractDuration, vacancies, employerId, agencyId, requirements, benefits } = body;

    const job = await db.jobOrder.create({
      data: {
        title, description, country, jobCategory, salaryMin, salaryMax,
        currency: currency || 'USD', contractDuration, vacancies: vacancies || 1,
        employerId, agencyId,
        requirements: requirements ? JSON.stringify(requirements) : null,
        benefits: benefits ? JSON.stringify(benefits) : null,
        createdById: body.createdById,
      },
    });

    // Create default ATS stages
    for (let i = 0; i < DEFAULT_ATS_STAGES.length; i++) {
      await db.aTSStage.create({
        data: {
          jobOrderId: job.id,
          name: DEFAULT_ATS_STAGES[i],
          order: i,
          color: STAGE_COLORS[i],
          isDefault: true,
        },
      });
    }

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Jobs POST error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
