import ZAI from 'z-ai-web-dev-sdk';

// Initialize ZAI client
let zaiInstance: any = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Generic AI prompt function
export async function aiPrompt(prompt: string, options: any = {}) {
  try {
    const zai = await getZAI();
    
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant integrated into the Oxx workspace. Provide helpful, concise, and actionable responses.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
    });

    const messageContent = completion.choices[0]?.message?.content;
    
    return {
      response: messageContent || 'No response generated',
      usage: completion.usage,
      model: completion.model
    };
  } catch (error) {
    console.error('AI prompt error:', error);
    throw new Error('Failed to generate AI response');
  }
}

// Summarize content
export async function aiSummarize(content: string) {
  try {
    const zai = await getZAI();
    
    const prompt = `Please summarize the following content in a clear and concise manner:

${content}

Provide a summary that:
1. Captures the main points
2. Is easy to understand
3. Is no more than 3-4 sentences long`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at summarizing content. Provide clear, concise summaries that capture the essential information.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const messageContent = completion.choices[0]?.message?.content;
    
    return {
      summary: messageContent || 'No summary generated',
      usage: completion.usage
    };
  } catch (error) {
    console.error('AI summarization error:', error);
    throw new Error('Failed to generate summary');
  }
}

// Generate tasks from project description
export async function aiGenerateTasks(projectDescription: string) {
  try {
    const zai = await getZAI();
    
    const prompt = `Based on the following project description, generate a list of actionable tasks:

Project Description: ${projectDescription}

Please provide:
1. A list of specific, actionable tasks
2. Each task should have a clear title and brief description
3. Organize tasks by priority (High, Medium, Low)
4. Include estimated complexity for each task

Format the response as a JSON object with the following structure:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "priority": "High|Medium|Low",
      "complexity": "Simple|Medium|Complex"
    }
  ]
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a project management expert. Generate practical, actionable tasks from project descriptions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const messageContent = completion.choices[0]?.message?.content;
    
    // Try to parse as JSON, fallback to text if parsing fails
    try {
      const tasksData = JSON.parse(messageContent || '{}');
      return {
        tasks: tasksData.tasks || [],
        rawResponse: messageContent,
        usage: completion.usage
      };
    } catch (parseError) {
      return {
        tasks: [],
        rawResponse: messageContent,
        usage: completion.usage,
        error: 'Failed to parse tasks JSON'
      };
    }
  } catch (error) {
    console.error('AI task generation error:', error);
    throw new Error('Failed to generate tasks');
  }
}

// Analyze sentiment of text
export async function aiAnalyzeSentiment(text: string) {
  try {
    const zai = await getZAI();
    
    const prompt = `Analyze the sentiment of the following text and provide a detailed analysis:

Text: "${text}"

Please provide:
1. Overall sentiment (Positive, Negative, or Neutral)
2. Confidence level (0-100%)
3. Key emotional indicators
4. Brief explanation of the analysis

Format the response as a JSON object:
{
  "sentiment": "Positive|Negative|Neutral",
  "confidence": 85,
  "indicators": ["keyword1", "keyword2"],
  "explanation": "Brief explanation"
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at sentiment analysis. Provide accurate, nuanced sentiment analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    const messageContent = completion.choices[0]?.message?.content;
    
    // Try to parse as JSON, fallback to text if parsing fails
    try {
      const sentimentData = JSON.parse(messageContent || '{}');
      return {
        sentiment: sentimentData.sentiment || 'Neutral',
        confidence: sentimentData.confidence || 50,
        indicators: sentimentData.indicators || [],
        explanation: sentimentData.explanation || 'No explanation provided',
        usage: completion.usage
      };
    } catch (parseError) {
      return {
        sentiment: 'Neutral',
        confidence: 50,
        indicators: [],
        explanation: 'Failed to parse sentiment analysis',
        rawResponse: messageContent,
        usage: completion.usage
      };
    }
  } catch (error) {
    console.error('AI sentiment analysis error:', error);
    throw new Error('Failed to analyze sentiment');
  }
}

// Generate content ideas
export async function aiGenerateContentIdeas(topic: string, contentType: string = 'general') {
  try {
    const zai = await getZAI();
    
    const prompt = `Generate creative content ideas for the following topic and content type:

Topic: ${topic}
Content Type: ${contentType}

Please provide:
1. 5-10 unique content ideas
2. Each idea should have a catchy title
3. Brief description for each idea
4. Target audience suggestion
5. Content format recommendation

Format the response as a JSON object:
{
  "ideas": [
    {
      "title": "Idea title",
      "description": "Brief description",
      "targetAudience": "Target audience",
      "format": "Content format"
    }
  ]
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a creative content strategist. Generate innovative and engaging content ideas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1200,
    });

    const messageContent = completion.choices[0]?.message?.content;
    
    // Try to parse as JSON, fallback to text if parsing fails
    try {
      const ideasData = JSON.parse(messageContent || '{}');
      return {
        ideas: ideasData.ideas || [],
        rawResponse: messageContent,
        usage: completion.usage
      };
    } catch (parseError) {
      return {
        ideas: [],
        rawResponse: messageContent,
        usage: completion.usage,
        error: 'Failed to parse content ideas JSON'
      };
    }
  } catch (error) {
    console.error('AI content ideas generation error:', error);
    throw new Error('Failed to generate content ideas');
  }
}

// Improve writing
export async function aiImproveWriting(text: string, improvementType: string = 'general') {
  try {
    const zai = await getZAI();
    
    const prompt = `Improve the following text. Focus on ${improvementType} improvements:

Original text: "${text}"

Please provide:
1. Improved version of the text
2. List of specific improvements made
3. Explanation of why these improvements enhance the text

Format the response as a JSON object:
{
  "improvedText": "Improved version of the text",
  "improvements": ["Improvement 1", "Improvement 2"],
  "explanation": "Explanation of improvements"
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert editor and writing coach. Provide constructive improvements to text while maintaining the original meaning and voice.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 800,
    });

    const messageContent = completion.choices[0]?.message?.content;
    
    // Try to parse as JSON, fallback to text if parsing fails
    try {
      const improvementData = JSON.parse(messageContent || '{}');
      return {
        improvedText: improvementData.improvedText || text,
        improvements: improvementData.improvements || [],
        explanation: improvementData.explanation || 'No explanation provided',
        usage: completion.usage
      };
    } catch (parseError) {
      return {
        improvedText: messageContent || text,
        improvements: [],
        explanation: 'Failed to parse improvement data',
        rawResponse: messageContent,
        usage: completion.usage
      };
    }
  } catch (error) {
    console.error('AI writing improvement error:', error);
    throw new Error('Failed to improve writing');
  }
}

// Generate image (if supported)
export async function aiGenerateImage(prompt: string, size: string = '1024x1024') {
  try {
    const zai = await getZAI();
    
    const response = await zai.images.generations.create({
      prompt: prompt,
      size: size
    });

    const imageData = response.data[0];
    
    return {
      imageBase64: imageData.base64,
      revisedPrompt: imageData.revised_prompt || prompt,
      usage: response.usage
    };
  } catch (error) {
    console.error('AI image generation error:', error);
    throw new Error('Failed to generate image');
  }
}

// Web search functionality
export async function aiWebSearch(query: string, numResults: number = 10) {
  try {
    const zai = await getZAI();
    
    const searchResult = await zai.functions.invoke("web_search", {
      query: query,
      num: numResults
    });

    return {
      results: searchResult,
      query: query,
      resultCount: searchResult.length
    };
  } catch (error) {
    console.error('AI web search error:', error);
    throw new Error('Failed to perform web search');
  }
}

// Knowledge graph analysis
export async function aiAnalyzeKnowledgeGraph(nodes: any[], edges: any[]) {
  try {
    const zai = await getZAI();
    
    const prompt = `Analyze the following knowledge graph data and provide insights:

Nodes: ${JSON.stringify(nodes.slice(0, 10))} // Limit to first 10 nodes for context
Edges: ${JSON.stringify(edges.slice(0, 10))} // Limit to first 10 edges for context

Please provide:
1. Key patterns and relationships identified
2. Important nodes or hubs in the network
3. Recommendations for improving the knowledge graph
4. Potential missing connections or insights

Format the response as a JSON object:
{
  "patterns": ["Pattern 1", "Pattern 2"],
  "keyNodes": ["Node 1", "Node 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "missingConnections": ["Connection 1", "Connection 2"]
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a knowledge graph analysis expert. Provide insights about network structures and relationships.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 1000,
    });

    const messageContent = completion.choices[0]?.message?.content;
    
    // Try to parse as JSON, fallback to text if parsing fails
    try {
      const analysisData = JSON.parse(messageContent || '{}');
      return {
        patterns: analysisData.patterns || [],
        keyNodes: analysisData.keyNodes || [],
        recommendations: analysisData.recommendations || [],
        missingConnections: analysisData.missingConnections || [],
        rawResponse: messageContent,
        usage: completion.usage
      };
    } catch (parseError) {
      return {
        patterns: [],
        keyNodes: [],
        recommendations: [],
        missingConnections: [],
        rawResponse: messageContent,
        usage: completion.usage,
        error: 'Failed to parse knowledge graph analysis'
      };
    }
  } catch (error) {
    console.error('AI knowledge graph analysis error:', error);
    throw new Error('Failed to analyze knowledge graph');
  }
}