import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireFira } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isRead = searchParams.get('isRead');

    // Owner-only: can only fetch own notifications
    if (userId && userId !== auth.userId) {
      return NextResponse.json({ error: 'You can only view your own notifications' }, { status: 403 });
    }

    const where: Record<string, unknown> = { userId: auth.userId };
    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireFira(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json();
    const { userId, title, message, type, link } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'userId, title, and message are required' },
        { status: 400 }
      );
    }

    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'info',
        link: link || null,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Notifications POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json();
    const { notificationId, isRead, markAllRead } = body;

    if (markAllRead) {
      // Mark all notifications as read for the authenticated user
      const result = await db.notification.updateMany({
        where: { userId: auth.userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, updatedCount: result.count });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId is required' }, { status: 400 });
    }

    // Owner-only: can only update own notifications
    const notification = await db.notification.findUnique({ where: { id: notificationId } });
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    if (notification.userId !== auth.userId) {
      return NextResponse.json({ error: 'You can only update your own notifications' }, { status: 403 });
    }

    const updated = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: isRead !== undefined ? isRead : true },
    });

    return NextResponse.json({ notification: updated });
  } catch (error) {
    console.error('Notifications PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
