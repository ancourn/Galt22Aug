import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const document = await db.document.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id },
          { visibility: 'public' },
        ],
      },
      include: {
        shares: {
          where: {
            sharedWith: session.user.id,
            permission: { in: ['view', 'edit', 'download'] },
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check team visibility permissions
    if (document.visibility === 'team' && document.teamId) {
      const teamMember = await db.teamMember.findFirst({
        where: {
          teamId: document.teamId,
          userId: session.user.id,
        },
      });

      if (!teamMember && document.userId !== session.user.id && document.shares.length === 0) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Check if user has download permission
    if (document.userId !== session.user.id && document.shares.length === 0) {
      return NextResponse.json({ error: 'Download permission denied' }, { status: 403 });
    }

    // Check if file exists
    try {
      await readFile(document.filePath);
    } catch (error) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
    }

    // Read file and return it
    const fileBuffer = await readFile(document.filePath);

    // Update access log for shares
    if (document.shares.length > 0) {
      await db.documentShare.updateMany({
        where: {
          documentId: document.id,
          sharedWith: session.user.id,
        },
        data: { accessedAt: new Date() },
      });
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `attachment; filename="${document.originalName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}