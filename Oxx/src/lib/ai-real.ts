import { AIResponse } from './ai';

/**
 * Real AI service implementation using Ollama
 * This should replace the mock AI service when Ollama is available
 */

export async function aiPromptReal(prompt: string): Promise<AIResponse> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const endTime = Date.now();
    
    return {
      response: data.response,
      timestamp: new Date().toISOString(),
      model: 'llama3',
      tokens: data.eval_count || Math.floor(data.response.length / 4)
    };
  } catch (error) {
    console.error('Real AI service error:', error);
    
    // Fallback to mock service if real AI is unavailable
    console.log('Falling back to mock AI service...');
    const { aiPrompt } = await import('./ai');
    return aiPrompt(prompt);
  }
}

export async function aiSummarizeReal(content: string): Promise<AIResponse> {
  const prompt = `Please provide a concise summary of the following text:\n\n${content}\n\nSummary:`;
  return aiPromptReal(prompt);
}

export async function aiGenerateTasksReal(projectDescription: string): Promise<AIResponse> {
  const prompt = `Based on the following project description, generate a list of specific, actionable tasks:\n\n${projectDescription}\n\nTasks:`;
  return aiPromptReal(prompt);
}

export async function aiAnalyzeSentimentReal(text: string): Promise<AIResponse> {
  const prompt = `Analyze the sentiment of the following text and provide a brief explanation:\n\n${text}\n\nSentiment Analysis:`;
  return aiPromptReal(prompt);
}

/**
 * Advanced AI features for the Oxx workspace
 */

export async function aiGenerateProjectDescription(title: string, keywords: string[]): Promise<AIResponse> {
  const prompt = `Generate a professional project description for a project titled "${title}" with these keywords: ${keywords.join(', ')}. Include objectives, scope, and key deliverables.`;
  return aiPromptReal(prompt);
}

export async function aiExtractKeywords(text: string): Promise<AIResponse> {
  const prompt = `Extract the most important keywords and phrases from the following text. Return them as a comma-separated list:\n\n${text}`;
  return aiPromptReal(prompt);
}

export async function aiGenerateMeetingAgenda(topics: string[]): Promise<AIResponse> {
  const prompt = `Create a structured meeting agenda for the following topics: ${topics.join(', ')}. Include time allocations and discussion points.`;
  return aiPromptReal(prompt);
}

export async function aiImproveWriting(text: string, style: 'professional' | 'casual' | 'concise' = 'professional'): Promise<AIResponse> {
  const prompt = `Improve the following text to make it more ${style}. Maintain the core meaning while enhancing clarity and impact:\n\n${text}`;
  return aiPromptReal(prompt);
}

/**
 * Check if Ollama service is available
 */
export async function isAIServiceAvailable(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get available AI models
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.models?.map((model: any) => model.name) || [];
  } catch {
    return [];
  }
}

/**
 * Hybrid AI service that automatically switches between real and mock AI
 */
export async function aiPromptHybrid(prompt: string): Promise<AIResponse> {
  const isRealAvailable = await isAIServiceAvailable();
  
  if (isRealAvailable) {
    console.log('🤖 Using real AI service (Ollama)');
    return aiPromptReal(prompt);
  } else {
    console.log('🎭 Using mock AI service');
    const { aiPrompt } = await import('./ai');
    return aiPrompt(prompt);
  }
}

// Export all functions with hybrid fallback
export const aiSummarizeHybrid = async (content: string): Promise<AIResponse> => {
  const isRealAvailable = await isAIServiceAvailable();
  return isRealAvailable ? aiSummarizeReal(content) : (await import('./ai')).aiSummarize(content);
};

export const aiGenerateTasksHybrid = async (projectDescription: string): Promise<AIResponse> => {
  const isRealAvailable = await isAIServiceAvailable();
  return isRealAvailable ? aiGenerateTasksReal(projectDescription) : (await import('./ai')).aiGenerateTasks(projectDescription);
};

export const aiAnalyzeSentimentHybrid = async (text: string): Promise<AIResponse> => {
  const isRealAvailable = await isAIServiceAvailable();
  return isRealAvailable ? aiAnalyzeSentimentReal(text) : (await import('./ai')).aiAnalyzeSentiment(text);
};