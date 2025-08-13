import { z } from 'zod';
export const taskCreateSchema = z.object({
    title: z.string().min(1, 'title is required'),
    description: z.string().optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
});
export const taskUpdateSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    completed: z.boolean().optional(),
    dueDate: z.string().datetime().optional().nullable(),
});
export const listQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    completed: z.enum(['true', 'false']).optional(),
    dueBefore: z.string().datetime().optional(),
    dueAfter: z.string().datetime().optional(),
    sortBy: z.enum(['createdAt', 'dueDate', 'title', 'completed']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export function parseBody(schema, body) {
    const res = schema.safeParse(body);
    if (!res.success) {
        const details = res.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
        return { ok: false, details };
    }
    return { ok: true, data: res.data };
}
export function parseQuery(schema, query) {
    const res = schema.safeParse(query);
    if (!res.success) {
        const details = res.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
        return { ok: false, details };
    }
    return { ok: true, data: res.data };
}
//# sourceMappingURL=validation.js.map