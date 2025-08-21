import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const filters = searchParams.get('filters') ? JSON.parse(searchParams.get('filters')!) : {};
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query.trim()) {
      return NextResponse.json({ results: [], total: 0 });
    }

    // Build where clause for search
    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { extractedText: { contains: query, mode: 'insensitive' } },
        { metadata: { path: '$.entities[*].text', string_contains: query } },
      ],
      AND: [
        { status: 'ready' }, // Only search processed documents
      ],
    };

    // Apply filters
    if (filters.fileType) {
      where.AND.push({ mimeType: { contains: filters.fileType } });
    }

    if (filters.dateFrom) {
      where.AND.push({ createdAt: { gte: new Date(filters.dateFrom) } });
    }

    if (filters.dateTo) {
      where.AND.push({ createdAt: { lte: new Date(filters.dateTo) } });
    }

    if (filters.teamId) {
      where.AND.push({ teamId: filters.teamId });
    }

    if (filters.projectId) {
      where.AND.push({ projectId: filters.projectId });
    }

    if (filters.userId) {
      where.AND.push({ userId: filters.userId });
    }

    // Add visibility filter
    where.AND.push({
      OR: [
        { userId: session.user.id },
        { visibility: 'public' },
        { visibility: 'team' },
      ],
    });

    // Get documents matching search criteria
    const documents = await db.document.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        team: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, title: true },
        },
        task: {
          select: { id: true, title: true },
        },
        analyses: {
          select: { id: true, type: true, analysis: true },
          where: { type: { in: ['summary', 'key_phrases'] } },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
        { title: 'asc' },
      ],
      take: limit,
    });

    // Filter out documents user doesn't have access to based on team visibility
    const accessibleDocuments = await Promise.all(
      documents.map(async (doc) => {
        if (doc.visibility === 'team' && doc.teamId) {
          const teamMember = await db.teamMember.findFirst({
            where: {
              teamId: doc.teamId,
              userId: session.user.id,
            },
          });

          if (!teamMember && doc.userId !== session.user.id) {
            return null;
          }
        }
        return doc;
      })
    );

    const filteredDocuments = accessibleDocuments.filter(Boolean);

    // Calculate relevance scores and highlight matches
    const results = filteredDocuments.map((doc) => {
      if (!doc) return null;

      const titleMatch = doc.title.toLowerCase().includes(query.toLowerCase());
      const descriptionMatch = doc.description?.toLowerCase().includes(query.toLowerCase());
      const textMatch = doc.extractedText?.toLowerCase().includes(query.toLowerCase());

      let relevanceScore = 0;
      if (titleMatch) relevanceScore += 10;
      if (descriptionMatch) relevanceScore += 5;
      if (textMatch) relevanceScore += 2;

      // Get context around the match
      let context = '';
      if (doc.extractedText) {
        const queryIndex = doc.extractedText.toLowerCase().indexOf(query.toLowerCase());
        if (queryIndex !== -1) {
          const start = Math.max(0, queryIndex - 100);
          const end = Math.min(doc.extractedText.length, queryIndex + query.length + 100);
          context = doc.extractedText.substring(start, end);
          // Highlight the match
          context = context.replace(
            new RegExp(query, 'gi'),
            (match) => `<mark>${match}</mark>`
          );
        }
      }

      return {
        id: doc.id,
        title: doc.title,
        description: doc.description,
        fileName: doc.originalName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        user: doc.user,
        team: doc.team,
        project: doc.project,
        task: doc.task,
        relevanceScore,
        context,
        analyses: doc.analyses,
      };
    }).filter(Boolean);

    // Sort by relevance score
    results.sort((a, b) => (b?.relevanceScore || 0) - (a?.relevanceScore || 0));

    return NextResponse.json({
      results,
      total: results.length,
      query,
      filters,
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}