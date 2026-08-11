import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireFira, requireRole } from '@/lib/auth';

function excludePassword<T extends Record<string, unknown>>(user: T): Omit<T, 'password'> {
  const { password: _pw, ...rest } = user as T & { password: unknown };
  return rest;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(request, ['super_admin'])
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      include: {
        applicantProfile: true,
        employerProfile: true,
        agencyMembers: {
          include: { agency: { select: { id: true, name: true } } },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: excludePassword(user) });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Allow own profile update (requireAuth) or FIRA admin update (requireFira)
  const authCheck = requireAuth(request)
  if (authCheck instanceof NextResponse) return authCheck

  // If not FIRA, ensure user is updating their own profile
  const { id } = await params
  if (authCheck.userRole !== 'super_admin' && authCheck.userRole !== 'staff' && authCheck.userRole !== 'international_agency') {
    if (authCheck.userId !== id) {
      return NextResponse.json({ error: 'You can only update your own profile' }, { status: 403 })
    }
  }

  try {
    const body = await request.json();
    const { name, phone, avatar, role, isActive, isApproved } = body;

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isApproved !== undefined) updateData.isApproved = isApproved;

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ user: excludePassword(user) });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(request, ['super_admin'])
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params;

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await db.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
