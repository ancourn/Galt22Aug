"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot, Send, Sparkles, FileText, Target, Heart, Lightbulb, Edit, Image, Search, Network } from 'lucide-react';

interface AIResponse {
  response: string;
  timestamp: string;
  model?: string;
  tokens?: number;
  usage?: any;
}

interface AIAssistantProps {
  className?: string;
  onResponse?: (response: AIResponse) => void;
}

export function AIAssistant({ className, onResponse }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<string>('prompt');

  const handleAction = async () => {
    if (!prompt.trim() && action !== 'prompt') return;
    
    setIsLoading(true);
    try {
      let body: any = {};
      
      switch (action) {
        case 'prompt':
          body = { prompt };
          break;
        case 'summarize':
          body = { action: 'summarize', content: prompt };
          break;
        case 'generate-tasks':
          body = { action: 'generate-tasks', content: prompt };
          break;
        case 'analyze-sentiment':
          body = { action: 'analyze-sentiment', text: prompt };
          break;
        case 'generate-content-ideas':
          body = { action: 'generate-content-ideas', topic: prompt, contentType: 'general' };
          break;
        case 'improve-writing':
          body = { action: 'improve-writing', text: prompt, improvementType: 'general' };
          break;
        case 'generate-image':
          body = { action: 'generate-image', prompt, size: '1024x1024' };
          break;
        case 'web-search':
          body = { action: 'web-search', query: prompt, numResults: 5 };
          break;
        default:
          body = { prompt };
      }

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      
      if (data.success) {
        const aiResponse: AIResponse = {
          response: data.response || data.summary || data.improvedText || data.rawResponse || JSON.stringify(data),
          timestamp: new Date().toISOString(),
          model: data.model || 'z-ai-model',
          tokens: data.usage?.total_tokens || data.tokens,
          usage: data.usage
        };
        setResponse(aiResponse);
        onResponse?.(aiResponse);
      } else {
        setResponse({
          response: `❌ Error: ${data.error || 'Unknown error occurred'}`,
          timestamp: new Date().toISOString(),
          model: 'error'
        });
      }
    } catch (error) {
      setResponse({
        response: `❌ Network error: Unable to connect to AI service`,
        timestamp: new Date().toISOString(),
        model: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { 
      label: 'Ask AI', 
      action: 'prompt',
      icon: Bot,
      placeholder: "Ask anything...",
      description: 'Get answers to your questions'
    },
    { 
      label: 'Summarize', 
      action: 'summarize',
      icon: FileText,
      placeholder: 'Paste text to summarize...',
      description: 'Get a concise summary of any text'
    },
    { 
      label: 'Generate Tasks', 
      action: 'generate-tasks',
      icon: Target,
      placeholder: 'Describe your project...',
      description: 'Generate tasks from project description'
    },
    { 
      label: 'Analyze Sentiment', 
      action: 'analyze-sentiment',
      icon: Heart,
      placeholder: 'Enter text to analyze...',
      description: 'Analyze emotional tone and sentiment'
    },
    { 
      label: 'Content Ideas', 
      action: 'generate-content-ideas',
      icon: Lightbulb,
      placeholder: 'Enter a topic...',
      description: 'Generate creative content ideas'
    },
    { 
      label: 'Improve Writing', 
      action: 'improve-writing',
      icon: Edit,
      placeholder: 'Enter text to improve...',
      description: 'Get suggestions to improve your writing'
    },
    { 
      label: 'Generate Image', 
      action: 'generate-image',
      icon: Image,
      placeholder: 'Describe an image...',
      description: 'Generate images from text descriptions'
    },
    { 
      label: 'Web Search', 
      action: 'web-search',
      icon: Search,
      placeholder: 'Enter search query...',
      description: 'Search the web for information'
    },
  ];

  const currentAction = quickActions.find(a => a.action === action);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Assistant
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by Z-AI
          </Badge>
        </CardTitle>
        <CardDescription>
          Ask AI questions, summarize content, generate tasks, or analyze text
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Selector */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((quickAction) => (
            <Button
              key={quickAction.action}
              variant={action === quickAction.action ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAction(quickAction.action)}
              className="flex items-center gap-1"
            >
              <quickAction.icon className="h-3 w-3" />
              {quickAction.label}
            </Button>
          ))}
        </div>

        {/* Description */}
        {currentAction && (
          <p className="text-sm text-muted-foreground">
            {currentAction.description}
          </p>
        )}

        {/* Input */}
        <div className="space-y-2">
          <Textarea
            placeholder={currentAction?.placeholder || "Ask anything..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleAction} 
            disabled={isLoading || (!prompt.trim() && action !== 'prompt')}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {currentAction?.label || 'Ask AI'}
              </>
            )}
          </Button>
        </div>

        {/* Response */}
        {response && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>AI Response</span>
              <span className="text-xs">
                {response.model} • {new Date(response.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-muted p-3 rounded-lg text-sm whitespace-pre-wrap">
              {response.response}
            </div>
            {response.tokens && (
              <div className="text-xs text-muted-foreground">
                ~{response.tokens} tokens used
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}