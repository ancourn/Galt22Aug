import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  url: string;
  metadata?: any;
  score?: number;
}

// Mock search data - in a real implementation, this would query Meilisearch
const mockSearchData: SearchResult[] = [
  // Projects
  {
    id: "project_1",
    moduleId: "projects",
    title: "Website Redesign Project",
    content: "Complete redesign of the company website with modern UI/UX principles and responsive design.",
    url: "http://localhost:10240/project/1",
    score: 0.95
  },
  {
    id: "project_2",
    moduleId: "projects",
    title: "Mobile App Development",
    content: "Native mobile application for iOS and Android platforms with real-time synchronization.",
    url: "http://localhost:10240/project/2",
    score: 0.87
  },
  {
    id: "task_1",
    moduleId: "projects",
    title: "Setup Database Schema",
    content: "Design and implement the database schema for the new user management system.",
    url: "http://localhost:10240/task/1",
    score: 0.82
  },

  // Care (Zammad)
  {
    id: "ticket_1",
    moduleId: "care",
    title: "Login Issue Reported",
    content: "User unable to login to the system due to incorrect password reset flow.",
    url: "http://localhost:20240/ticket/1",
    score: 0.91
  },
  {
    id: "ticket_2",
    moduleId: "care",
    title: "Feature Request: Dark Mode",
    content: "Customer requesting dark mode support for better user experience in low-light conditions.",
    url: "http://localhost:20240/ticket/2",
    score: 0.78
  },

  // Wiki (Outline)
  {
    id: "wiki_1",
    moduleId: "wiki",
    title: "Getting Started Guide",
    content: "Comprehensive guide for new users to get started with the Oxlas platform and its features.",
    url: "http://localhost:3002/doc/getting-started",
    score: 0.93
  },
  {
    id: "wiki_2",
    moduleId: "wiki",
    title: "API Documentation",
    content: "Complete API reference documentation with examples and integration guides for developers.",
    url: "http://localhost:3002/doc/api-reference",
    score: 0.85
  },
  {
    id: "wiki_3",
    moduleId: "wiki",
    title: "Team Collaboration Best Practices",
    content: "Best practices for effective team collaboration using Oxlas tools and features.",
    url: "http://localhost:3002/doc/collaboration",
    score: 0.76
  },

  // Chat (Matrix)
  {
    id: "chat_1",
    moduleId: "chat",
    title: "Project Kickoff Discussion",
    content: "Initial discussion about the new project requirements, timeline, and team assignments.",
    url: "http://localhost:8081/#/room/!project-kickoff:oxlas.com",
    score: 0.88
  },
  {
    id: "chat_2",
    moduleId: "chat",
    title: "Daily Standup Notes",
    content: "Team standup meeting notes including progress updates and blockers.",
    url: "http://localhost:8081/#/room/!daily-standup:oxlas.com",
    score: 0.72
  },

  // Forms (Formbricks)
  {
    id: "form_1",
    moduleId: "forms",
    title: "User Satisfaction Survey",
    content: "Quarterly user satisfaction survey to collect feedback on platform features and usability.",
    url: "http://localhost:3003/survey/user-satisfaction",
    score: 0.89
  },
  {
    id: "form_2",
    moduleId: "forms",
    title: "Feature Request Form",
    content: "Form for users to submit new feature requests and product improvements.",
    url: "http://localhost:3003/form/feature-request",
    score: 0.83
  },

  // Notes (Joplin)
  {
    id: "note_1",
    moduleId: "notes",
    title: "Meeting Notes - Q4 Planning",
    content: "Detailed notes from Q4 planning meeting including budget allocation and strategic initiatives.",
    url: "http://localhost:22300/notes/q4-planning",
    score: 0.86
  },
  {
    id: "note_2",
    moduleId: "notes",
    title: "Product Ideas Brainstorm",
    content: "Brainstorming session notes for new product features and improvements.",
    url: "http://localhost:22300/notes/product-ideas",
    score: 0.79
  },
  {
    id: "note_3",
    moduleId: "notes",
    title: "Technical Architecture Decisions",
    content: "Important technical decisions and architectural considerations for the platform.",
    url: "http://localhost:22300/notes/architecture-decisions",
    score: 0.74
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim();

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Simple search implementation - in production, this would use Meilisearch
    const results = mockSearchData
      .filter(item => {
        const searchText = `${item.title} ${item.content}`.toLowerCase();
        return searchText.includes(query);
      })
      .map(item => ({
        ...item,
        // Boost score based on query match quality
        score: item.score * (
          item.title.toLowerCase().includes(query) ? 1.2 : 1.0
        )
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10); // Limit to top 10 results

    return NextResponse.json({ 
      results,
      query,
      total: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

// Mock function to simulate Meilisearch integration
async function searchWithMeilisearch(query: string): Promise<SearchResult[]> {
  // In a real implementation, this would call Meilisearch:
  /*
  const response = await fetch(`${MEILISEARCH_URL}/indexes/oxlas-search/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MEILISEARCH_MASTER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      limit: 20,
      attributesToHighlight: ['title', 'content'],
      attributesToCrop: ['content'],
      cropLength: 100,
    }),
  });
  
  const data = await response.json();
  return data.hits.map((hit: any) => ({
    id: hit.id,
    moduleId: hit.moduleId,
    title: hit._formatted.title,
    content: hit._formatted.content,
    url: hit.url,
    metadata: hit.metadata,
    score: hit._rankingScore,
  }));
  */
  
  return [];
}