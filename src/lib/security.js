import { v4 as uuidv4 } from 'uuid';

/**
 * SECURITY UTILITIES
 * Hardening for Client-Side Gaod AI
 */

// --- 1. Logger with PII Redaction & Request ID ---

const SENSITIVE_KEYS = ['password', 'token', 'key', 'secret', 'authorization'];
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

export class SecurityLogger {
  constructor(context = 'Global') {
    this.context = context;
  }

  _redact(obj) {
    if (typeof obj === 'string') {
      return obj.replace(EMAIL_REGEX, '[REDACTED_EMAIL]');
    }
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return obj.map(item => this._redact(item));
      }
      const newObj = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
            newObj[key] = '[REDACTED]';
          } else {
            newObj[key] = this._redact(obj[key]);
          }
        }
      }
      return newObj;
    }
    return obj;
  }

  log(level, message, data = {}) {
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();
    const safeData = this._redact(data);

    const logEntry = {
      timestamp,
      level,
      context: this.context,
      requestId,
      message,
      data: safeData
    };

    // In a real app, send this to a remote log server.
    // Here we wrap console.
    if (level === 'ERROR') {
      console.error(`[${timestamp}] [ERROR] [${this.context}] ${message}`, logEntry);
    } else if (level === 'WARN') {
      console.warn(`[${timestamp}] [WARN] [${this.context}] ${message}`, logEntry);
    } else {
      console.log(`[${timestamp}] [INFO] [${this.context}] ${message}`, logEntry);
    }

    return requestId;
  }

  info(message, data) { return this.log('INFO', message, data); }
  warn(message, data) { return this.log('WARN', message, data); }
  error(message, data) { return this.log('ERROR', message, data); }
}

export const logger = new SecurityLogger('App');

// --- 2. Input Validation (Schema) ---

export const MessageSchema = {
  content: {
    type: 'string',
    minLength: 1,
    maxLength: 20000, // Reasonable limit for LLM input
  },
  role: {
    type: 'enum',
    allowed: ['user', 'assistant', 'system']
  }
};

export const Validator = {
  validateMessage: (content, role) => {
    const errors = [];

    // Content Validation
    if (typeof content !== 'string') {
      errors.push("Content must be a string.");
    } else {
      if (content.trim().length < MessageSchema.content.minLength) {
        errors.push("Message cannot be empty.");
      }
      if (content.length > MessageSchema.content.maxLength) {
        errors.push(`Message too long (max ${MessageSchema.content.maxLength} chars).`);
      }
    }

    // Role Validation
    if (!MessageSchema.role.allowed.includes(role)) {
      errors.push(`Invalid role: ${role}. Allowed: ${MessageSchema.role.allowed.join(', ')}.`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// --- 3. Rate Limiting (Token Bucket - Local Storage) ---

const RL_PREFIX = 'gaod_rl_';

export class RateLimiter {
  constructor(limit = 10, windowSeconds = 60) {
    this.limit = limit;
    this.windowSeconds = windowSeconds;
  }

  /**
   * Checks if action is allowed for the user.
   * returns { allowed: boolean, remaining: number, resetTime: number }
   */
  check(userId, action = 'default') {
    const key = `${RL_PREFIX}${userId}_${action}`;
    const now = Date.now();

    let bucket = JSON.parse(localStorage.getItem(key));

    // Initialize or Reset if expired
    if (!bucket || now > bucket.resetTime) {
      bucket = {
        tokens: this.limit,
        resetTime: now + (this.windowSeconds * 1000)
      };
    }

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      localStorage.setItem(key, JSON.stringify(bucket));
      return { allowed: true, remaining: bucket.tokens, resetTime: bucket.resetTime };
    } else {
      return { allowed: false, remaining: 0, resetTime: bucket.resetTime };
    }
  }
}

export const chatRateLimiter = new RateLimiter(10, 60); // 10 messages per minute
