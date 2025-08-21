// Validation utilities for the Oxx AI-Powered Workspace

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// User validation
export function validateUser(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (data.role && !['user', 'admin'].includes(data.role)) {
    errors.push('Role must be either "user" or "admin"');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Project validation
export function validateProject(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length < 1) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (data.description && data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  if (data.status && !['active', 'completed', 'archived'].includes(data.status)) {
    errors.push('Status must be one of: active, completed, archived');
  }

  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    errors.push('Priority must be one of: low, medium, high');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Note validation
export function validateNote(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length < 1) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (data.content && data.content.length > 10000) {
    errors.push('Content must be less than 10000 characters');
  }

  if (data.tags) {
    if (!Array.isArray(data.tags)) {
      errors.push('Tags must be an array');
    } else {
      data.tags.forEach((tag: string, index: number) => {
        if (typeof tag !== 'string' || tag.trim().length === 0) {
          errors.push(`Tag at index ${index} must be a non-empty string`);
        } else if (tag.length > 50) {
          errors.push(`Tag at index ${index} must be less than 50 characters`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Automation validation
export function validateAutomation(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 1) {
    errors.push('Name is required');
  } else if (data.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (data.description && data.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  if (!data.trigger || typeof data.trigger !== 'object') {
    errors.push('Trigger must be a valid object');
  }

  if (!data.actions || !Array.isArray(data.actions) || data.actions.length === 0) {
    errors.push('Actions must be a non-empty array');
  } else {
    data.actions.forEach((action: any, index: number) => {
      if (!action.type || typeof action.type !== 'string') {
        errors.push(`Action at index ${index} must have a valid type`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Knowledge node validation
export function validateKnowledgeNode(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.moduleId || data.moduleId.trim().length < 1) {
    errors.push('Module ID is required');
  }

  if (!data.title || data.title.trim().length < 1) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (!data.type || data.type.trim().length < 1) {
    errors.push('Type is required');
  }

  if (data.content && data.content.length > 5000) {
    errors.push('Content must be less than 5000 characters');
  }

  if (data.url && !isValidUrl(data.url)) {
    errors.push('Invalid URL format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Knowledge edge validation
export function validateKnowledgeEdge(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.fromNodeId || data.fromNodeId.trim().length < 1) {
    errors.push('From node ID is required');
  }

  if (!data.toNodeId || data.toNodeId.trim().length < 1) {
    errors.push('To node ID is required');
  }

  if (!data.relation || data.relation.trim().length < 1) {
    errors.push('Relation is required');
  } else if (data.relation.length > 50) {
    errors.push('Relation must be less than 50 characters');
  }

  if (data.weight !== undefined && (typeof data.weight !== 'number' || data.weight < 0 || data.weight > 1)) {
    errors.push('Weight must be a number between 0 and 1');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Search validation
export function validateSearch(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.query || data.query.trim().length < 1) {
    errors.push('Search query is required');
  } else if (data.query.length > 200) {
    errors.push('Search query must be less than 200 characters');
  }

  if (data.limit !== undefined && (typeof data.limit !== 'number' || data.limit < 1 || data.limit > 100)) {
    errors.push('Limit must be a number between 1 and 100');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Utility functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Sanitization functions
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[{}]/g, '') // Remove potential curly braces
    .replace(/[\[\]]/g, ''); // Remove potential square brackets
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): { error: string; details?: any } {
  if (error instanceof ApiError) {
    return {
      error: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
    };
  }

  return {
    error: 'An unknown error occurred',
  };
}

// Response utilities
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(message: string, statusCode: number = 500, details?: any) {
  return {
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString(),
  };
}

// Rate limiting utilities
export interface RateLimitData {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitData>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean old entries
  for (const [k, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(k);
    }
  }

  const data = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };

  if (data.resetTime < now) {
    data.count = 0;
    data.resetTime = now + windowMs;
  }

  const allowed = data.count < maxRequests;
  const remaining = Math.max(0, maxRequests - data.count);

  if (allowed) {
    data.count++;
    rateLimitStore.set(key, data);
  }

  return {
    allowed,
    remaining,
    resetTime: data.resetTime,
  };
}

// Security utilities
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => {
        if (typeof item === 'string') {
          return sanitizeInput(item);
        } else if (typeof item === 'object' && item !== null) {
          return sanitizeObject(item);
        }
        return item;
      });
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function validateContentType(request: Request, allowedTypes: string[]): boolean {
  const contentType = request.headers.get('content-type');
  return allowedTypes.some(type => contentType?.includes(type));
}