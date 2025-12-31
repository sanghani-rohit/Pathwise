/**
 * API Utilities for PathWise
 * - Error handling
 * - Logging with correlation IDs
 * - Rate limiting
 */

import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'

// ==================== ERROR HANDLING ====================

export interface ApiError {
  error: string
  message?: string
  details?: any
  correlationId?: string
}

/**
 * Create a standardized JSON error response
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: any,
  correlationId?: string
): Response {
  const errorBody: ApiError = {
    error,
    details,
    correlationId,
  }

  // Log error on server with correlation ID
  console.error(`[${correlationId || 'no-id'}] API Error:`, {
    error,
    status,
    details: typeof details === 'object' ? JSON.stringify(details) : details,
    timestamp: new Date().toISOString(),
  })

  return new Response(JSON.stringify(errorBody), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId || 'unknown',
    },
  })
}

/**
 * Create a standardized JSON success response
 */
export function createSuccessResponse(data: any, correlationId?: string): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId || 'unknown',
    },
  })
}

// ==================== LOGGING ====================

/**
 * Get or create correlation ID from request
 */
export function getCorrelationId(request: NextRequest): string {
  return request.headers.get('x-request-id') || request.headers.get('x-correlation-id') || randomUUID()
}

/**
 * Log API request with correlation ID
 */
export function logApiRequest(
  correlationId: string,
  method: string,
  url: string,
  userId?: string
): void {
  console.log(`[${correlationId}] ${method} ${url}`, {
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString(),
  })
}

/**
 * Log API response with correlation ID
 */
export function logApiResponse(
  correlationId: string,
  status: number,
  duration: number
): void {
  console.log(`[${correlationId}] Response: ${status}`, {
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  })
}

// ==================== RATE LIMITING ====================

interface RateLimitEntry {
  count: number
  resetAt: number
  firstRequestAt: number
}

// In-memory rate limit store (for serverless, consider Redis or Upstash)
const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  maxRequests: number // Max requests allowed
  windowMs: number // Time window in milliseconds
  keyPrefix?: string // Prefix for rate limit keys
}

/**
 * Check rate limit for a user/IP
 * @returns true if rate limit exceeded, false if allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { limited: boolean; remaining: number; resetAt: number } {
  const key = `${config.keyPrefix || 'rl'}:${identifier}`
  const now = Date.now()

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries()
  }

  const entry = rateLimitStore.get(key)

  // No entry or expired window - create new
  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
      firstRequestAt: now,
    }
    rateLimitStore.set(key, newEntry)

    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
    }
  }

  // Increment counter
  entry.count++

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  return {
    limited: false,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Create rate limit error response
 */
export function createRateLimitResponse(resetAt: number, correlationId: string): Response {
  const resetIn = Math.ceil((resetAt - Date.now()) / 1000)

  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${resetIn} seconds.`,
      retryAfter: resetIn,
      correlationId,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': resetIn.toString(),
        'X-RateLimit-Reset': resetAt.toString(),
        'X-Correlation-ID': correlationId,
      },
    }
  )
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  let cleaned = 0

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
      cleaned++
    }
  }

  if (cleaned > 0) {
    console.log(`[Rate Limit] Cleaned up ${cleaned} expired entries`)
  }
}

// ==================== VALIDATION ====================

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter((field) => {
    const value = body[field]
    return value === undefined || value === null || value === ''
  })

  if (missing.length > 0) {
    return { valid: false, missing }
  }

  return { valid: true }
}

/**
 * Validate request size (prevent too large prompts)
 */
export function validateRequestSize(
  body: any,
  maxSizeKb: number = 100
): { valid: boolean; sizeKb?: number } {
  const jsonString = JSON.stringify(body)
  const sizeKb = new Blob([jsonString]).size / 1024

  if (sizeKb > maxSizeKb) {
    return { valid: false, sizeKb: Math.round(sizeKb) }
  }

  return { valid: true, sizeKb: Math.round(sizeKb) }
}

// ==================== UUID VALIDATION ====================

/**
 * Validate if string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
