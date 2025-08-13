import dotenv from 'dotenv';
import express, {} from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '../generated/prisma/index.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 4000);
app.get('/api/tasks', async (req, res) => {
    const { page = '1', pageSize = '20', completed, dueBefore, dueAfter, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
    const where = {};
    if (typeof completed === 'string') {
        if (completed === 'true' || completed === 'false') {
            where.completed = completed === 'true';
        }
    }
    if (dueBefore || dueAfter) {
        where.dueDate = {};
        if (dueAfter) {
            const dt = new Date(dueAfter);
            if (!isNaN(dt.getTime()))
                where.dueDate.gte = dt;
        }
        if (dueBefore) {
            const dt = new Date(dueBefore);
            if (!isNaN(dt.getTime()))
                where.dueDate.lte = dt;
        }
    }
    const validSortBy = new Set(['createdAt', 'dueDate', 'title', 'completed']);
    const sortKey = validSortBy.has(String(sortBy)) ? String(sortBy) : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 'asc' : 'desc';
    const p = Math.max(parseInt(String(page), 10) || 1, 1);
    const ps = Math.min(Math.max(parseInt(String(pageSize), 10) || 20, 1), 100);
    const [total, tasks] = await Promise.all([
        prisma.task.count({ where }),
        prisma.task.findMany({
            where,
            orderBy: { [sortKey]: sortDir },
            skip: (p - 1) * ps,
            take: ps,
        }),
    ]);
    res.setHeader('X-Total-Count', String(total));
    res.setHeader('X-Page', String(p));
    res.setHeader('X-Page-Size', String(ps));
    res.json(tasks);
});
app.post('/api/tasks', async (req, res) => {
    const { title, description, dueDate } = req.body;
    if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'title is required' });
    }
    const task = await prisma.task.create({
        data: {
            title,
            description: description ?? null,
            dueDate: dueDate ? new Date(dueDate) : null,
        },
    });
    res.status(201).json(task);
});
app.put('/api/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { title, description, dueDate, completed } = req.body;
    const data = {};
    if (title !== undefined)
        data.title = title;
    if (description !== undefined)
        data.description = description ?? null;
    if (completed !== undefined)
        data.completed = completed;
    if (dueDate !== undefined) {
        data.dueDate = dueDate ? new Date(dueDate) : null;
    }
    const task = await prisma.task.update({ where: { id }, data });
    res.json(task);
});
app.delete('/api/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);
    await prisma.task.delete({ where: { id } });
    res.status(204).end();
});
app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map