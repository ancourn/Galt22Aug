"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot, Send, Sparkles } from 'lucide-react';
import { AIResponse } from '@/lib/ai';

interface AIAssistantProps {
  className?: string;
  onResponse?: (response: AIResponse) => void;
}

export function AIAssistant({ className, onResponse }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<'prompt' | 'summarize' | 'generate-tasks' | 'analyze-sentiment'>('prompt');

  const handleAction = async () => {
    if (!prompt.trim() && action !== 'prompt') return;
    
    setIsLoading(true);
    try {
      const body = action === 'prompt' 
        ? { prompt } 
        : { action, content: prompt };

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      
      if (data.success) {
        const aiResponse: AIResponse = {
          response: data.response,
          timestamp: data.timestamp,
          model: data.model,
          tokens: data.tokens
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
      label: 'Summarize', 
      action: 'summarize' as const,
      placeholder: 'Paste text to summarize...',
      description: 'Get a concise summary of any text'
    },
    { 
      label: 'Generate Tasks', 
      action: 'generate-tasks' as const,
      placeholder: 'Describe your project...',
      description: 'Generate tasks from project description'
    },
    { 
      label: 'Analyze Sentiment', 
      action: 'analyze-sentiment' as const,
      placeholder: 'Enter text to analyze...',
      description: 'Analyze emotional tone and sentiment'
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
            Mock AI
          </Badge>
        </CardTitle>
        <CardDescription>
          Ask AI questions, summarize content, generate tasks, or analyze text
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Selector */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={action === 'prompt' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAction('prompt')}
          >
            Ask AI
          </Button>
          {quickActions.map((quickAction) => (
            <Button
              key={quickAction.action}
              variant={action === quickAction.action ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAction(quickAction.action)}
            >
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
                ~{response.tokens} tokens
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}