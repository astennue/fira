import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        applicantProfile: {
          include: {
            education: true,
            experience: true,
            skills: true,
            languages: true,
            certifications: true,
            references: true,
            documents: true,
            agency: { select: { name: true } },
          },
        },
        employerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { passwordHash, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Update user name
    if (body.name) {
      await db.user.update({ where: { id: userId }, data: { name: body.name } });
    }

    // Update applicant profile
    if (body.applicantProfile) {
      const { id, createdAt, updatedAt, ...profileData } = body.applicantProfile;
      await db.applicantProfile.upsert({
        where: { userId },
        update: profileData,
        create: { userId, ...profileData, nationality: profileData.nationality || 'Filipino' },
      });
    }

    // Update employer profile
    if (body.employerProfile) {
      const { id, createdAt, updatedAt, userId: _, ...profileData } = body.employerProfile;
      await db.employerProfile.upsert({
        where: { userId },
        update: profileData,
        create: { userId, ...profileData },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}