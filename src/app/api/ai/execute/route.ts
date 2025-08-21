import { NextRequest, NextResponse } from 'next/server';

interface ExecuteRequest {
  actionId: string;
  sessionId?: string;
  context?: Array<{ role: string; content: string }>;
}

interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Mock action executors - in a real implementation, these would call the actual services
const actionExecutors: Record<string, (params?: any) => Promise<ActionResult>> = {
  'create-project': async (params) => {
    try {
      // Mock creating a project in Planka
      // In reality, this would call the Planka API
      const projectData = {
        name: params?.name || 'New Project',
        description: params?.description || 'Created via Oxlas AI Co-Pilot',
        status: 'active'
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: `Project "${projectData.name}" created successfully in Planka!`,
        data: {
          projectId: `project_${Date.now()}`,
          ...projectData
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create project',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  'create-ticket': async (params) => {
    try {
      // Mock creating a ticket in Zammad
      const ticketData = {
        title: params?.title || 'New Support Ticket',
        description: params?.description || 'Created via Oxlas AI Co-Pilot',
        priority: params?.priority || 'normal'
      };
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        message: `Support ticket "${ticketData.title}" created successfully in Zammad!`,
        data: {
          ticketId: `ticket_${Date.now()}`,
          ...ticketData
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create support ticket',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  'create-wiki-page': async (params) => {
    try {
      // Mock creating a wiki page in Outline
      const pageData = {
        title: params?.title || 'New Wiki Page',
        content: params?.content || 'Created via Oxlas AI Co-Pilot',
        parentPath: params?.parentPath || '/'
      };
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return {
        success: true,
        message: `Wiki page "${pageData.title}" created successfully in Outline!`,
        data: {
          pageId: `page_${Date.now()}`,
          ...pageData
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create wiki page',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  'send-chat-message': async (params) => {
    try {
      // Mock sending a chat message in Matrix
      const messageData = {
        content: params?.content || 'Message sent via Oxlas AI Co-Pilot',
        room: params?.room || '#general',
        sender: 'Oxlas AI'
      };
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return {
        success: true,
        message: `Message sent successfully to Matrix chat room "${messageData.room}"!`,
        data: {
          messageId: `msg_${Date.now()}`,
          ...messageData
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send chat message',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  'create-form': async (params) => {
    try {
      // Mock creating a form in Formbricks
      const formData = {
        name: params?.name || 'New Form',
        description: params?.description || 'Created via Oxlas AI Co-Pilot',
        fields: params?.fields || []
      };
      
      await new Promise(resolve => setTimeout(resolve, 900));
      
      return {
        success: true,
        message: `Form "${formData.name}" created successfully in Formbricks!`,
        data: {
          formId: `form_${Date.now()}`,
          ...formData
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create form',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  'create-note': async (params) => {
    try {
      // Mock creating a note in Joplin
      const noteData = {
        title: params?.title || 'New Note',
        content: params?.content || 'Created via Oxlas AI Co-Pilot',
        notebook: params?.notebook || 'Default'
      };
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        message: `Note "${noteData.title}" created successfully in Joplin!`,
        data: {
          noteId: `note_${Date.now()}`,
          ...noteData
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create note',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const { actionId, sessionId, context = [] }: ExecuteRequest = await request.json();

    if (!actionId) {
      return NextResponse.json({ error: 'Action ID is required' }, { status: 400 });
    }

    // Check if the action executor exists
    const executor = actionExecutors[actionId];
    if (!executor) {
      return NextResponse.json({ error: `Unknown action: ${actionId}` }, { status: 400 });
    }

    // Extract parameters from context if needed
    let actionParams = {};
    
    // Try to extract relevant information from the conversation context
    if (context.length > 0) {
      const lastUserMessage = context.find(m => m.role === 'user')?.content || '';
      
      // Simple parameter extraction based on action type
      switch (actionId) {
        case 'create-project':
          actionParams = {
            name: extractProjectName(lastUserMessage),
            description: lastUserMessage
          };
          break;
        case 'create-ticket':
          actionParams = {
            title: extractTicketTitle(lastUserMessage),
            description: lastUserMessage
          };
          break;
        case 'create-wiki-page':
          actionParams = {
            title: extractWikiPageTitle(lastUserMessage),
            content: lastUserMessage
          };
          break;
        case 'send-chat-message':
          actionParams = {
            content: extractChatMessage(lastUserMessage),
            room: extractChatRoom(lastUserMessage)
          };
          break;
        case 'create-form':
          actionParams = {
            name: extractFormName(lastUserMessage),
            description: lastUserMessage
          };
          break;
        case 'create-note':
          actionParams = {
            title: extractNoteTitle(lastUserMessage),
            content: lastUserMessage
          };
          break;
      }
    }

    // Execute the action
    const result = await executor(actionParams);

    // Log the action execution (in a real implementation, this would be stored in the database)
    console.log(`Action executed: ${actionId}`, {
      sessionId,
      result,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Action execution error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to execute action',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions for parameter extraction
function extractProjectName(message: string): string {
  const patterns = [
    /create\s+(?:a\s+)?project\s+(?:called\s+|named\s+)?["']?([^"'\.]+)/i,
    /project\s+["']?([^"'\.]+)/i,
    /new\s+project\s+(?:called\s+|named\s+)?["']?([^"'\.]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return 'New Project';
}

function extractTicketTitle(message: string): string {
  const patterns = [
    /create\s+(?:a\s+)?ticket\s+(?:called\s+|named\s+)?["']?([^"'\.]+)/i,
    /ticket\s+["']?([^"'\.]+)/i,
    /support\s+ticket\s+(?:called\s+|named\s+)?["']?([^"'\.]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return 'New Support Ticket';
}

function extractWikiPageTitle(message: string): string {
  const patterns = [
    /create\s+(?:a\s+)?wiki\s+page\s+(?:called\s+|named\s+)?["']?([^"'\.]+)/i,
    /wiki\s+page\s+["']?([^"'\.]+)/i,
    /page\s+(?:called\s+|named\s+)?["']?([^"'\.]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return 'New Wiki Page';
}

function extractChatMessage(message: string): string {
  // Extract the message content after action keywords
  const patterns = [
    /send\s+(?:a\s+)?message\s+(?:saying\s+)?["']?([^"'\.]+)/i,
    /message\s+(?:saying\s+)?["']?([^"'\.]+)/i,
    /chat\s+(?:saying\s+)?["']?([^"'\.]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return 'Message from Oxlas AI';
}

function extractChatRoom(message: string): string {
  const patterns = [
    /(?:to|in)\s+(?:room\s+)?#?([a-zA-Z0-9_-]+)/i,
    /#([a-zA-Z0-9_-]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return `#${match[1].trim()}`;
    }
  }
  return '#general';
}

function extractFormName(message: string): string {
  const patterns = [
    /create\s+(?:a\s+)?form\s+(?:called\s+|named\s+)?["']?([^"'\.]+)/i,
    /form\s+["']?([^"'\.]+)/i,
    /survey\s+(?:called\s+|named\s+)?["']?([^"'\.]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return 'New Form';
}

function extractNoteTitle(message: string): string {
  const patterns = [
    /create\s+(?:a\s+)?note\s+(?:called\s+|named\s+)?["']?([^"'\.]+)/i,
    /note\s+(?:called\s+|named\s+)?["']?([^"'\.]+)/i,
    /memo\s+(?:called\s+|named\s+)?["']?([^"'\.]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return 'New Note';
}