'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface MailAttachment {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  createdAt: string;
}

interface Mail {
  id: string;
  userId: string;
  from: string;
  fromName?: string;
  to: string;
  toNames?: string;
  cc?: string;
  bcc?: string;
  subject: string;
  content: string;
  textContent?: string;
  status: string;
  folder: string;
  read: boolean;
  starred: boolean;
  important: boolean;
  hasAttachments: boolean;
  attachments?: any;
  replyTo?: string;
  replyToName?: string;
  inReplyTo?: string;
  messageId?: string;
  threadId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  mailAttachments: MailAttachment[];
}

interface MailStats {
  counts: {
    inbox: number;
    sent: number;
    draft: number;
    trash: number;
    archived: number;
    starred: number;
    unread: number;
    recent: number;
    withAttachments: number;
  };
  storage: {
    estimatedMails: number;
    estimatedSize: number;
  };
}

interface MailResponse {
  mails: Mail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface UseMailOptions {
  folder?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  starred?: boolean;
  unread?: boolean;
}

export function useMail(options: UseMailOptions = {}) {
  const { data: session } = useSession();
  const [mails, setMails] = useState<Mail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchMails = async (opts: UseMailOptions = {}) => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (opts.folder) params.append('folder', opts.folder);
      if (opts.status) params.append('status', opts.status);
      if (opts.page) params.append('page', opts.page.toString());
      if (opts.limit) params.append('limit', opts.limit.toString());
      if (opts.search) params.append('search', opts.search);
      if (opts.starred) params.append('starred', 'true');
      if (opts.unread) params.append('unread', 'true');

      const response = await fetch(`/api/mail?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch mails');
      }

      const data: MailResponse = await response.json();
      setMails(data.mails);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createMail = async (mailData: {
    to: string;
    subject: string;
    content: string;
    toNames?: string;
    cc?: string;
    bcc?: string;
    textContent?: string;
    hasAttachments?: boolean;
    attachments?: any[];
  }) => {
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    try {
      const response = await fetch('/api/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailData),
      });

      if (!response.ok) {
        throw new Error('Failed to create mail');
      }

      const newMail = await response.json();
      setMails(prev => [newMail, ...prev]);
      return newMail;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateMail = async (id: string, updates: {
    read?: boolean;
    starred?: boolean;
    important?: boolean;
    folder?: string;
    status?: string;
  }) => {
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    try {
      const response = await fetch(`/api/mail/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update mail');
      }

      const updatedMail = await response.json();
      setMails(prev => prev.map(mail => 
        mail.id === id ? updatedMail : mail
      ));
      return updatedMail;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteMail = async (id: string) => {
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    try {
      const response = await fetch(`/api/mail/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete mail');
      }

      setMails(prev => prev.filter(mail => mail.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    fetchMails(options);
  }, [session?.user?.id, JSON.stringify(options)]);

  return {
    mails,
    loading,
    error,
    pagination,
    refetch: () => fetchMails(options),
    createMail,
    updateMail,
    deleteMail,
  };
}

export function useMailStats() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<MailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mail/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch mail stats');
      }

      const data: MailStats = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [session?.user?.id]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}