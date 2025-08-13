import dotenv from 'dotenv'
import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import { PrismaClient, Prisma } from '../generated/prisma/index.js'
import OpenAI from 'openai'
import {
  listQuerySchema,
  parseBody,
  parseQuery,
  taskCreateSchema,
  nlpInputSchema,
  taskUpdateSchema,
} from './validation.js'
import { errorHandler, notFound } from './errors.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const prisma = new PrismaClient()
const PORT = Number(process.env.PORT || 4000)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

app.get('/api/tasks', async (req: Request, res: Response) => {
  const parsed = parseQuery(listQuerySchema, req.query)
  if (!parsed.ok) {
    return res.status(400).json({ error: 'validation_error', details: parsed.details })
  }
  const { page, pageSize, completed, dueAfter, dueBefore, sortBy, sortOrder } = parsed.data

  const where: Prisma.TaskWhereInput = {}
  if (completed) where.completed = completed === 'true'
  if (dueBefore || dueAfter) {
    where.dueDate = {}
    if (dueAfter) where.dueDate.gte = new Date(dueAfter)
    if (dueBefore) where.dueDate.lte = new Date(dueBefore)
  }

  const orderBy = { [sortBy]: sortOrder } as Record<string, 'asc' | 'desc'>

  const [total, tasks] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({ where, orderBy: orderBy as any, skip: (page - 1) * pageSize, take: pageSize }),
  ])

  res.setHeader('X-Total-Count', String(total))
  res.setHeader('X-Page', String(page))
  res.setHeader('X-Page-Size', String(pageSize))
  res.json(tasks)
})

app.post('/api/tasks', async (req: Request, res: Response, next: NextFunction) => {
  const parsed = parseBody(taskCreateSchema, req.body)
  if (!parsed.ok) {
    return res.status(400).json({ error: 'validation_error', details: parsed.details })
  }
  const { title, description, dueDate } = parsed.data
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })
    res.status(201).json(task)
  } catch (err) {
    next(err)
  }
})

app.put('/api/tasks/:id', async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id)
  const parsed = parseBody(taskUpdateSchema, req.body)
  if (!parsed.ok) {
    return res.status(400).json({ error: 'validation_error', details: parsed.details })
  }
  const { title, description, dueDate, completed } = parsed.data

  const data: Prisma.TaskUpdateInput = {}
  if (title !== undefined) data.title = title
  if (description !== undefined) data.description = description ?? null
  if (completed !== undefined) data.completed = completed
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null
  try {
    const task = await prisma.task.update({ where: { id }, data })
    res.json(task)
  } catch (err) {
    next(err)
  }
})

app.delete('/api/tasks/:id', async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id)
  try {
    await prisma.task.delete({ where: { id } })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// Minimal NLP endpoint placeholder (expects client to provide text; server returns parsed shape)
app.post('/api/nlp/parse', async (req: Request, res: Response) => {
  const parsed = parseBody(nlpInputSchema, req.body)
  if (!parsed.ok) {
    return res.status(400).json({ error: 'validation_error', details: parsed.details })
  }
  const { text } = parsed.data
  // Use OpenAI to extract task fields
  const prompt = `Extract a single task from the user's input. Return strict JSON with keys: title (string), description (string|null), dueDate (ISO string|null). If no due date is specified, set dueDate to null.
Input: ${text}`
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You extract structured task data as strict JSON.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0,
  })
  const content = completion.choices[0]?.message?.content ?? ''
  let json: any
  try {
    json = JSON.parse(content)
  } catch {
    return res.status(502).json({ error: 'nlp_parse_error', message: 'Model returned non-JSON' })
  }
  // Basic shape guard
  if (!json || typeof json.title !== 'string') {
    return res.status(502).json({ error: 'nlp_parse_error', message: 'Invalid extraction shape' })
  }
  res.json({ title: json.title, description: json.description ?? null, dueDate: json.dueDate ?? null })
})

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})

// Not found & error handlers
app.use(notFound)
app.use(errorHandler)


