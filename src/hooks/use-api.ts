'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  mutate: (data: any) => Promise<T>;
}

export function useApi<T>(
  url: string,
  options: ApiOptions = {},
  immediate = true
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchData = async (customOptions?: ApiOptions) => {
    setLoading(true);
    setError(null);

    try {
      const fetchOptions: RequestInit = {
        method: customOptions?.method || options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...customOptions?.headers,
        },
        ...(customOptions?.body || options.body
          ? { body: JSON.stringify(customOptions.body || options.body) }
          : {}),
      };

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const mutate = async (data: any): Promise<T> => {
    return fetchData({ ...options, body: data });
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    if (immediate && session) {
      fetchData();
    }
  }, [url, JSON.stringify(options), immediate, session]);

  return { data, loading, error, refetch, mutate };
}

// Specific API hooks for common operations
export function useUsers() {
  return useApi('/api/users');
}

export function useUser(id: string) {
  return useApi(`/api/users/${id}`);
}

export function useProjects(filters?: { status?: string; priority?: string }) {
  const queryString = new URLSearchParams(filters).toString();
  const url = `/api/projects${queryString ? `?${queryString}` : ''}`;
  return useApi(url);
}

export function useProject(id: string) {
  return useApi(`/api/projects/${id}`);
}

export function useNotes(filters?: { tag?: string; search?: string }) {
  const queryString = new URLSearchParams(filters).toString();
  const url = `/api/notes${queryString ? `?${queryString}` : ''}`;
  return useApi(url);
}

export function useNote(id: string) {
  return useApi(`/api/notes/${id}`);
}

export function useAutomations(filters?: { enabled?: boolean }) {
  const queryString = new URLSearchParams(filters).toString();
  const url = `/api/automations${queryString ? `?${queryString}` : ''}`;
  return useApi(url);
}

export function useAutomation(id: string) {
  return useApi(`/api/automations/${id}`);
}

export function useKnowledgeNodes(filters?: { moduleId?: string; type?: string; search?: string; limit?: number }) {
  const queryString = new URLSearchParams(filters).toString();
  const url = `/api/knowledge/nodes${queryString ? `?${queryString}` : ''}`;
  return useApi(url);
}

export function useKnowledgeNode(id: string) {
  return useApi(`/api/knowledge/nodes/${id}`);
}

export function useKnowledgeEdges(filters?: { fromNodeId?: string; toNodeId?: string; relation?: string; limit?: number }) {
  const queryString = new URLSearchParams(filters).toString();
  const url = `/api/knowledge/edges${queryString ? `?${queryString}` : ''}`;
  return useApi(url);
}

export function useKnowledgeEdge(id: string) {
  return useApi(`/api/knowledge/edges/${id}`);
}

export function useKnowledgeRecommendations(filters?: { nodeId?: string; moduleId?: string; limit?: number }) {
  const queryString = new URLSearchParams(filters).toString();
  const url = `/api/knowledge/recommendations${queryString ? `?${queryString}` : ''}`;
  return useApi(url);
}

export function useSearch(query: string, filters?: { moduleId?: string; type?: string; limit?: number }) {
  const queryString = new URLSearchParams({ q: query, ...filters }).toString();
  const url = `/api/search${queryString ? `?${queryString}` : ''}`;
  return useApi(url, {}, !!query);
}

// Mutation hooks for CRUD operations
export function useCreateProject() {
  const { data: session } = useSession();
  
  return async (projectData: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    metadata?: any;
  }) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create project');
    }

    return response.json();
  };
}

export function useUpdateProject() {
  return async (id: string, projectData: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    metadata?: any;
  }) => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update project');
    }

    return response.json();
  };
}

export function useDeleteProject() {
  return async (id: string) => {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete project');
    }

    return response.json();
  };
}

export function useCreateNote() {
  return async (noteData: {
    title: string;
    content?: string;
    tags?: string[];
    metadata?: any;
  }) => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create note');
    }

    return response.json();
  };
}

export function useUpdateNote() {
  return async (id: string, noteData: {
    title?: string;
    content?: string;
    tags?: string[];
    metadata?: any;
  }) => {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update note');
    }

    return response.json();
  };
}

export function useDeleteNote() {
  return async (id: string) => {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete note');
    }

    return response.json();
  };
}

// Knowledge graph mutation hooks
export function useCreateKnowledgeNode() {
  return async (nodeData: {
    moduleId: string;
    title: string;
    type: string;
    content?: string;
    url?: string;
    metadata?: any;
  }) => {
    const response = await fetch('/api/knowledge/nodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nodeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create knowledge node');
    }

    return response.json();
  };
}

export function useUpdateKnowledgeNode() {
  return async (id: string, nodeData: {
    title?: string;
    type?: string;
    content?: string;
    url?: string;
    metadata?: any;
  }) => {
    const response = await fetch(`/api/knowledge/nodes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nodeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update knowledge node');
    }

    return response.json();
  };
}

export function useDeleteKnowledgeNode() {
  return async (id: string) => {
    const response = await fetch(`/api/knowledge/nodes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete knowledge node');
    }

    return response.json();
  };
}

export function useCreateKnowledgeEdge() {
  return async (edgeData: {
    fromNodeId: string;
    toNodeId: string;
    relation: string;
    weight?: number;
    metadata?: any;
  }) => {
    const response = await fetch('/api/knowledge/edges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(edgeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create knowledge edge');
    }

    return response.json();
  };
}

export function useUpdateKnowledgeEdge() {
  return async (id: string, edgeData: {
    relation?: string;
    weight?: number;
    metadata?: any;
  }) => {
    const response = await fetch(`/api/knowledge/edges/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(edgeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update knowledge edge');
    }

    return response.json();
  };
}

export function useDeleteKnowledgeEdge() {
  return async (id: string) => {
    const response = await fetch(`/api/knowledge/edges/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete knowledge edge');
    }

    return response.json();
  };
}

export function useGenerateRecommendations() {
  return async (action: string, data: { nodeId?: string; moduleId?: string }) => {
    const response = await fetch('/api/knowledge/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...data }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate recommendations');
    }

    return response.json();
  };
}

// Automation mutation hooks
export function useCreateAutomation() {
  return async (automationData: {
    name: string;
    description?: string;
    enabled?: boolean;
    trigger: any;
    actions: any[];
  }) => {
    const response = await fetch('/api/automations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(automationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create automation');
    }

    return response.json();
  };
}

export function useUpdateAutomation() {
  return async (id: string, automationData: {
    name?: string;
    description?: string;
    enabled?: boolean;
    trigger?: any;
    actions?: any[];
  }) => {
    const response = await fetch(`/api/automations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(automationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update automation');
    }

    return response.json();
  };
}

export function useDeleteAutomation() {
  return async (id: string) => {
    const response = await fetch(`/api/automations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete automation');
    }

    return response.json();
  };
}

export function useExecuteAutomation() {
  return async (id: string) => {
    const response = await fetch(`/api/automations/${id}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to execute automation');
    }

    return response.json();
  };
}

export function useAutomationExecutions(automationId: string, filters?: { status?: string; limit?: number; offset?: number }) {
  const queryString = new URLSearchParams(filters).toString();
  const url = `/api/automations/${automationId}/executions${queryString ? `?${queryString}` : ''}`;
  return useApi(url);
}

// Document management hooks
export function useDocuments(filters?: { 
  search?: string; 
  status?: string; 
  visibility?: string; 
  teamId?: string; 
  projectId?: string; 
  taskId?: string;
  page?: number;
  limit?: number;
}) {
  const queryString = new URLSearchParams(filters).toString();
  const url = `/api/documents${queryString ? `?${queryString}` : ''}`;
  return useApi(url);
}

export function useDocument(id: string) {
  return useApi(`/api/documents/${id}`);
}

export function useDocumentSearch(query: string, filters?: { 
  fileType?: string; 
  dateFrom?: string; 
  dateTo?: string; 
  teamId?: string; 
  projectId?: string; 
  userId?: string;
  limit?: number;
}) {
  const queryString = new URLSearchParams({ q: query, ...filters }).toString();
  const url = `/api/documents/search${queryString ? `?${queryString}` : ''}`;
  return useApi(url, {}, !!query);
}

export function useUploadDocument() {
  return async (formData: FormData) => {
    const response = await fetch('/api/documents', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload document');
    }

    return response.json();
  };
}

export function useUpdateDocument() {
  return async (id: string, documentData: {
    title?: string;
    description?: string;
    visibility?: string;
    tags?: string;
  }) => {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update document');
    }

    return response.json();
  };
}

export function useDeleteDocument() {
  return async (id: string) => {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete document');
    }

    return response.json();
  };
}

export function useShareDocument() {
  return async (id: string, shareData: {
    sharedWith: string;
    permission: 'view' | 'edit' | 'download';
    message?: string;
    expiresAt?: string;
  }) => {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'share',
        ...shareData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to share document');
    }

    return response.json();
  };
}

export function useReprocessDocument() {
  return async (id: string) => {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'reprocess',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reprocess document');
    }

    return response.json();
  };
}

export function useArchiveDocument() {
  return async (id: string) => {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'archive',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to archive document');
    }

    return response.json();
  };
}