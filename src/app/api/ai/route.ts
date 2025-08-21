import { NextRequest, NextResponse } from 'next/server';
import { 
  aiPrompt, 
  aiSummarize, 
  aiGenerateTasks, 
  aiAnalyzeSentiment,
  aiGenerateContentIdeas,
  aiImproveWriting,
  aiGenerateImage,
  aiWebSearch,
  aiAnalyzeKnowledgeGraph
} from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, action, content, topic, contentType, text, improvementType, size, query, numResults, nodes, edges } = await req.json();
    
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
        if (!text) {
          return NextResponse.json({ error: 'Text is required for sentiment analysis' }, { status: 400 });
        }
        result = await aiAnalyzeSentiment(text);
        break;
        
      case 'generate-content-ideas':
        if (!topic) {
          return NextResponse.json({ error: 'Topic is required for content idea generation' }, { status: 400 });
        }
        result = await aiGenerateContentIdeas(topic, contentType);
        break;
        
      case 'improve-writing':
        if (!text) {
          return NextResponse.json({ error: 'Text is required for writing improvement' }, { status: 400 });
        }
        result = await aiImproveWriting(text, improvementType);
        break;
        
      case 'generate-image':
        if (!prompt) {
          return NextResponse.json({ error: 'Prompt is required for image generation' }, { status: 400 });
        }
        result = await aiGenerateImage(prompt, size);
        break;
        
      case 'web-search':
        if (!query) {
          return NextResponse.json({ error: 'Query is required for web search' }, { status: 400 });
        }
        result = await aiWebSearch(query, numResults);
        break;
        
      case 'analyze-knowledge-graph':
        if (!nodes || !edges) {
          return NextResponse.json({ error: 'Nodes and edges are required for knowledge graph analysis' }, { status: 400 });
        }
        result = await aiAnalyzeKnowledgeGraph(nodes, edges);
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
      error: error instanceof Error ? error.message : 'Failed to process AI request' 
    }, { status: 500 });
  }
}