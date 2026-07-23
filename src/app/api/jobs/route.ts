import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ATS_STAGES = [
  'New Application',
  'Screening',
  'Interview Scheduled',
  'Interview Completed',
  'Skills Assessment',
  'Document Verification',
  'Medical Examination',
  'Background Check',
  'Agency Endorsement',
  'FIRA Review',
  'Employer Review',
  'Employer Interview',
  'Offer Sent',
  'Offer Accepted',
  'Contract Signing',
  'Visa Processing',
  'Pre-Deployment',
  'Deployed',
  'Completed',
];

function buildVisibilityFilter(visibility: string | null, userRole: string | null) {
  if (visibility) return { visibility };
  if (!userRole) return { visibility: 'public' };
  if (userRole === 'fira') return {};
  if (userRole === 'agency_admin' || userRole === 'agency_member') {
    return {
      OR: [
        { visibility: 'public' },
        { visibility: 'agency_only' },
      ],
    };
  }
  return { visibility: 'public' };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');
    const isPublic = searchParams.get('public');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    const where: Record<string, unknown> = {};

    if (country) where.country = country;
    if (category) where.category = category;
    if (status) where.status = status;

    if (isPublic === 'true') {
      where.visibility = 'public';
    } else {
      const visFilter = buildVisibilityFilter(visibility, userRole);
      Object.assign(where, visFilter);
    }

    if (search) {
      const existingOr = (where as Record<string, unknown>).OR;
      where.OR = [
        ...(Array.isArray(existingOr) ? existingOr : []),
        { title: { contains: search } },
        { description: { contains: search } },
        { requiredSkills: { contains: search } },
      ];
    }

    const jobs = await db.jobOrder.findMany({
      where,
      include: {
        employer: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        agency: {
          select: { id: true, name: true, country: true },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { postedDate: 'desc' },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Jobs GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userRole } = body;

    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const allowedRoles = ['fira', 'agency_admin', 'employer'];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const {
      title, description, country, city, category,
      salaryMin, salaryMax, salaryCurrency, contractType,
      duration, slots, requirements, benefits, requiredSkills,
      visibility, deadline, employerId, agencyId,
    } = body;

    if (!title || !description || !country || !category || !requirements || !requiredSkills) {
      return NextResponse.json(
        { error: 'title, description, country, category, requirements, and requiredSkills are required' },
        { status: 400 }
      );
    }

    const job = await db.jobOrder.create({
      data: {
        title, description, country, city: city || null, category,
        salaryMin: salaryMin != null ? Number(salaryMin) : null,
        salaryMax: salaryMax != null ? Number(salaryMax) : null,
        salaryCurrency: salaryCurrency || 'USD',
        contractType: contractType || 'full_time',
        duration: duration || null,
        slots: slots ? Number(slots) : 1,
        requirements, benefits: benefits || null, requiredSkills,
        status: 'open', visibility: visibility || 'public',
        deadline: deadline ? new Date(deadline) : null,
        employerId: employerId || null, agencyId: agencyId || null,
      },
    });

    const stageData = ATS_STAGES.map((name, index) => ({
      jobOrderId: job.id,
      name,
      order: index,
    }));

    await db.aTSStage.createMany({ data: stageData });

    const createdJob = await db.jobOrder.findUnique({
      where: { id: job.id },
      include: {
        employer: true,
        agency: { select: { id: true, name: true } },
        atsStages: { orderBy: { order: 'asc' } },
      },
    });

    return NextResponse.json({ job: createdJob }, { status: 201 });
  } catch (error) {
    console.error('Jobs POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
