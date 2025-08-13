import type { NextFunction, Request, Response } from 'express'
import { Prisma } from '../generated/prisma/index.js'

type ErrorBody = {
  error: string
  message: string
  details?: unknown
}

export function notFound(_req: Request, res: Response) {
  const body: ErrorBody = { error: 'not_found', message: 'Route not found' }
  res.status(404).json(body)
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Invalid JSON payloads from express.json/body-parser
  if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    const body: ErrorBody = { error: 'invalid_json', message: 'Invalid JSON body' }
    return res.status(400).json(body)
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      const body: ErrorBody = { error: 'record_not_found', message: 'Record not found' }
      return res.status(404).json(body)
    }
    if (err.code === 'P2002') {
      const body: ErrorBody = { error: 'unique_constraint', message: 'Unique constraint violated' }
      return res.status(409).json(body)
    }
    if (err.code === 'P2003') {
      const body: ErrorBody = { error: 'foreign_key_constraint', message: 'Foreign key constraint failed' }
      return res.status(409).json(body)
    }
    const body: ErrorBody = { error: 'prisma_error', message: 'Database error', details: { code: err.code } }
    return res.status(500).json(body)
  }

  // Fallback
  const body: ErrorBody = { error: 'internal_error', message: 'An unexpected error occurred' }
  return res.status(500).json(body)
}


