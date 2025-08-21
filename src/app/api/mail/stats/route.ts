import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/mail/stats - Get mail statistics for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get mail counts by folder
    const [inboxCount, sentCount, draftCount, trashCount, archivedCount, starredCount] = await Promise.all([
      db.mail.count({
        where: {
          userId: session.user.id,
          folder: 'inbox',
          status: 'inbox',
        },
      }),
      db.mail.count({
        where: {
          userId: session.user.id,
          folder: 'sent',
          status: 'sent',
        },
      }),
      db.mail.count({
        where: {
          userId: session.user.id,
          folder: 'draft',
          status: 'draft',
        },
      }),
      db.mail.count({
        where: {
          userId: session.user.id,
          folder: 'trash',
          status: 'trash',
        },
      }),
      db.mail.count({
        where: {
          userId: session.user.id,
          folder: 'archived',
          status: 'archived',
        },
      }),
      db.mail.count({
        where: {
          userId: session.user.id,
          starred: true,
        },
      }),
    ]);

    // Get unread count
    const unreadCount = await db.mail.count({
      where: {
        userId: session.user.id,
        folder: 'inbox',
        status: 'inbox',
        read: false,
      },
    });

    // Get recent mails (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMails = await db.mail.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get mails with attachments
    const mailsWithAttachments = await db.mail.count({
      where: {
        userId: session.user.id,
        hasAttachments: true,
      },
    });

    // Get storage usage (rough estimate)
    const storageUsage = await db.mail.aggregate({
      where: {
        userId: session.user.id,
      },
      _sum: {
        // This is a rough estimate - in reality you'd calculate actual file sizes
        createdAt: { count: true }, // Just using this as a proxy
      },
    });

    return NextResponse.json({
      counts: {
        inbox: inboxCount,
        sent: sentCount,
        draft: draftCount,
        trash: trashCount,
        archived: archivedCount,
        starred: starredCount,
        unread: unreadCount,
        recent: recentMails,
        withAttachments: mailsWithAttachments,
      },
      storage: {
        estimatedMails: storageUsage._sum.createdAt?.count || 0,
        estimatedSize: Math.round((storageUsage._sum.createdAt?.count || 0) * 0.05), // Rough estimate of 50KB per mail
      },
    });
  } catch (error) {
    console.error('Error fetching mail stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mail stats' },
      { status: 500 }
    );
  }
}