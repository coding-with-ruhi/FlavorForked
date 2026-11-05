import { ApiError } from '@shared/types'

export class AppError extends Error {
  constructor(
    public code: ApiError['code'],
    public message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const ErrorCodes = {
  UNAUTHENTICATED: { code: 'UNAUTHENTICATED' as const, status: 401 },
  FORBIDDEN: { code: 'FORBIDDEN' as const, status: 403 },
  NOT_FOUND: { code: 'NOT_FOUND' as const, status: 404 },
  VALIDATION_FAILED: { code: 'VALIDATION_FAILED' as const, status: 400 },
  RATE_LIMITED: { code: 'RATE_LIMITED' as const, status: 429 },
  AI_FAILED: { code: 'AI_FAILED' as const, status: 500 },
  NOT_FOOD: { code: 'NOT_FOOD' as const, status: 400 },
  INTERNAL: { code: 'INTERNAL' as const, status: 500 },
} as const

export function createError(
  code: ApiError['code'],
  message: string
): ApiError {
  return { code, message }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
