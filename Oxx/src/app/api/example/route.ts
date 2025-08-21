import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // First, create or get a test user
    let user = await db.user.findUnique({
      where: { email: 'developer@oxx.ai' }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: 'developer@oxx.ai',
          name: 'Developer User',
          role: 'admin',
          preferences: {
            theme: 'light',
            notifications: true
          }
        }
      });
    }

    // Create a test project
    const project = await db.project.create({
      data: {
        title: 'My First Project',
        description: 'Created via API test',
        userId: user.id,
        status: 'active',
        priority: 'medium',
        metadata: {
          createdVia: 'api-test',
          version: '1.0'
        }
      },
    });

    // Create a test note
    const note = await db.note.create({
      data: {
        title: 'Meeting Notes',
        content: 'Initial meeting notes for the project setup',
        userId: user.id,
        tags: JSON.stringify(['meeting', 'setup', 'important']),
        metadata: {
          project: project.id,
          priority: 'high'
        }
      },
    });

    return Response.json({ 
      success: true, 
      project,
      note,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      message: 'Sample data created successfully!'
    });
  } catch (error) {
    console.error('Error creating sample data:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create sample data',
      details: error.message 
    }, { status: 500 });
  }
}