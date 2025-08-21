import { NextRequest, NextResponse } from 'next/server';

interface ModuleAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  module: string;
}

interface GenerateRequest {
  prompt: string;
  context?: Array<{ role: string; content: string }>;
  sessionId?: string;
  availableActions?: ModuleAction[];
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, context = [], sessionId, availableActions = [] }: GenerateRequest = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Build conversation context for the AI
    const systemPrompt = `You are Oxlas AI Co-Pilot, an intelligent assistant that helps users across multiple workspace modules: Projects, Care, Wiki, Chat, Forms, and Notes.

Your capabilities include:
1. Understanding user requests and providing helpful responses
2. Identifying when users want to perform actions across different modules
3. Suggesting relevant actions based on user intent
4. Maintaining context of the conversation

Available actions you can suggest:
${availableActions.map(action => 
  `- ${action.name}: ${action.description} (Module: ${action.module})`
).join('\n')}

When a user expresses intent to perform an action (e.g., "create a project", "make a ticket", "write a note"), identify the most relevant action and include it in your response.

Response format:
- Provide a helpful, conversational response
- If an action is relevant, include an "actions" array with the suggested action(s)
- Include metadata about your response type

Example response structure:
{
  "response": "I can help you create a new project. Here's what I can do:",
  "metadata": { "type": "action_suggestion" },
  "actions": [
    {
      "id": "create-project",
      "name": "Create Project",
      "description": "Create a new project in Planka",
      "icon": "📋",
      "module": "projects"
    }
  ]
}`;

    // Build the complete conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...context,
      { role: 'user', content: prompt }
    ];

    // Proxy the request to Ollama
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3',
        prompt: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Ollama');
    }

    const ollamaData = await response.json();
    
    // Parse the AI response and extract actions
    const aiResponse = ollamaData.response;
    let suggestedActions: ModuleAction[] = [];
    let metadata = { type: 'general' };

    // Simple action detection based on keywords
    const actionKeywords = {
      'create-project': ['project', 'planka', 'board', 'task', 'kanban'],
      'create-ticket': ['ticket', 'support', 'help', 'zammad', 'issue'],
      'create-wiki-page': ['wiki', 'documentation', 'outline', 'page', 'doc'],
      'send-chat-message': ['chat', 'message', 'matrix', 'notify', 'team'],
      'create-form': ['form', 'survey', 'formbricks', 'questionnaire'],
      'create-note': ['note', 'joplin', 'memo', 'reminder']
    };

    // Detect relevant actions based on prompt
    const lowerPrompt = prompt.toLowerCase();
    for (const [actionId, keywords] of Object.entries(actionKeywords)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        const action = availableActions.find(a => a.id === actionId);
        if (action) {
          suggestedActions.push(action);
          metadata = { type: 'action_suggestion' };
        }
      }
    }

    // If no specific action detected, check for general action words
    if (suggestedActions.length === 0) {
      const generalActionWords = ['create', 'make', 'add', 'new', 'start'];
      if (generalActionWords.some(word => lowerPrompt.includes(word))) {
        // Suggest the most relevant actions based on context
        suggestedActions = availableActions.slice(0, 2); // Top 2 actions
        metadata = { type: 'general_action_suggestion' };
      }
    }

    return NextResponse.json({
      response: aiResponse,
      metadata,
      actions: suggestedActions.length > 0 ? suggestedActions : undefined
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}