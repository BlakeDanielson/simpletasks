import dotenv from 'dotenv'
import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import { PrismaClient, Prisma } from '../generated/prisma/index.js'
import {
  listQuerySchema,
  parseBody,
  parseQuery,
  taskCreateSchema,
  taskUpdateSchema,
} from './validation.js'
import { errorHandler, notFound } from './errors.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const prisma = new PrismaClient()
const PORT = Number(process.env.PORT || 4000)

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

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})

// Not found & error handlers
app.use(notFound)
app.use(errorHandler)


