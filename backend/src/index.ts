import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '../generated/prisma/index.js'

const app = express()
app.use(cors())
app.use(express.json())

const prisma = new PrismaClient()
const PORT = Number(process.env.PORT || 4000)

app.get('/api/tasks', async (_req, res) => {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(tasks)
})

app.post('/api/tasks', async (req, res) => {
  const { title, description, dueDate } = req.body
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title is required' })
  }
  const task = await prisma.task.create({
    data: {
      title,
      description: description ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  })
  res.status(201).json(task)
})

app.put('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { title, description, dueDate, completed } = req.body
  const task = await prisma.task.update({
    where: { id },
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      completed,
    },
  })
  res.json(task)
})

app.delete('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id)
  await prisma.task.delete({ where: { id } })
  res.status(204).end()
})

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})


