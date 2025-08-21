import { NextRequest, NextResponse } from 'next/server';
import { aiPrompt, aiSummarize, aiGenerateTasks, aiAnalyzeSentiment } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, action, content } = await req.json();
    
    let result;
    
    switch (action) {
      case 'summarize':
        if (!content) {
          return NextResponse.json({ error: 'Content is required for summarization' }, { status: 400 });
        }
        result = await aiSummarize(content);
        break;
        
      case 'generate-tasks':
        if (!content) {
          return NextResponse.json({ error: 'Project description is required for task generation' }, { status: 400 });
        }
        result = await aiGenerateTasks(content);
        break;
        
      case 'analyze-sentiment':
        if (!content) {
          return NextResponse.json({ error: 'Text is required for sentiment analysis' }, { status: 400 });
        }
        result = await aiAnalyzeSentiment(content);
        break;
        
      default:
        if (!prompt) {
          return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }
        result = await aiPrompt(prompt);
        break;
    }
    
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process AI request' 
    }, { status: 500 });
  }
}