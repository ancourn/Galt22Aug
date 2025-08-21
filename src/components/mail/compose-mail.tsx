'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Paperclip, X, Plus, Eye } from 'lucide-react';
import { useMail } from '@/hooks/use-mail';

interface ComposeMailProps {
  onClose: () => void;
  onSend: () => void;
  defaultTo?: string;
  defaultSubject?: string;
}

export default function ComposeMail({ onClose, onSend, defaultTo = '', defaultSubject = '' }: ComposeMailProps) {
  const { createMail } = useMail();
  const [to, setTo] = useState(defaultTo);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [content, setContent] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachments(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!to || !subject || !content) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    try {
      await createMail({
        to,
        toNames: JSON.stringify([to.split('@')[0]]),
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject,
        content,
        textContent: content.replace(/<[^>]*>/g, ''),
        hasAttachments: attachments.length > 0,
        attachments: attachments.map(file => ({
          filename: file.name,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          filePath: `/uploads/${file.name}`,
        })),
      });
      
      onSend();
      onClose();
    } catch (error) {
      console.error('Error sending mail:', error);
      alert('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>New Message</CardTitle>
              <CardDescription>Compose and send your email</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* To field */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium w-12">To:</label>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Recipient email address"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCc(!showCc)}
              >
                Cc
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBcc(!showBcc)}
              >
                Bcc
              </Button>
            </div>

            {/* CC field */}
            {showCc && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium w-12">Cc:</label>
                <Input
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="CC recipients"
                  className="flex-1"
                />
              </div>
            )}

            {/* BCC field */}
            {showBcc && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium w-12">Bcc:</label>
                <Input
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="BCC recipients"
                  className="flex-1"
                />
              </div>
            )}

            {/* Subject field */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium w-12">Subject:</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="flex-1"
              />
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Attachments:</label>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2">
                      <Paperclip className="h-3 w-3" />
                      <span className="text-xs">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(file.size)})
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message:</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your message here..."
                className="min-h-[300px]"
              />
            </div>

            {/* Formatting toolbar (simple) */}
            <div className="flex items-center gap-2 p-2 border rounded-lg">
              <Button variant="ghost" size="sm">
                <strong>B</strong>
              </Button>
              <Button variant="ghost" size="sm">
                <em>I</em>
              </Button>
              <Button variant="ghost" size="sm">
                <u>U</u>
              </Button>
              <div className="w-px h-6 bg-border mx-2"></div>
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                type="file"
                multiple
                onChange={handleFileAttach}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Attach File
              </Button>
            </div>
          </div>
        </CardContent>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              Save Draft
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              <Send className="h-4 w-4 mr-2" />
              {isSending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}