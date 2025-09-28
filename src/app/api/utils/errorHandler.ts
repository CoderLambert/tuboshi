import { NextResponse } from 'next/server'

export class ApiError extends Error {
  status: number
  details?: any

  constructor(status: number, message: string, details?: any) {
    super(message)
    this.status = status
    this.details = details
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', details?: any) {
    super(400, message, details)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', details?: any) {
    super(401, message, details)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', details?: any) {
    super(403, message, details)
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error', details?: any) {
    super(500, message, details)
  }
}

export function errorHandler(err: unknown) {
  console.error('API Error:', err)

  if (err instanceof ApiError) {
    return NextResponse.json(
      { success: false, message: err.message, details: err.details },
      { status: err.status },
    )
  }

  return NextResponse.json(
    { success: false, message: 'Internal Server Error' },
    { status: 500 },
  )
}

export const errorMessages = {
  invalid_gpt_config: 'Invalid GPT Config',
}
