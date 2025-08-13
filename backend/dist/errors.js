import { Prisma } from '../generated/prisma/index.js';
export function notFound(_req, res) {
    const body = { error: 'not_found', message: 'Route not found' };
    res.status(404).json(body);
}
export function errorHandler(err, _req, res, _next) {
    // Invalid JSON payloads from express.json/body-parser
    if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
        const body = { error: 'invalid_json', message: 'Invalid JSON body' };
        return res.status(400).json(body);
    }
    // Prisma known request errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
            const body = { error: 'record_not_found', message: 'Record not found' };
            return res.status(404).json(body);
        }
        if (err.code === 'P2002') {
            const body = { error: 'unique_constraint', message: 'Unique constraint violated' };
            return res.status(409).json(body);
        }
        if (err.code === 'P2003') {
            const body = { error: 'foreign_key_constraint', message: 'Foreign key constraint failed' };
            return res.status(409).json(body);
        }
        const body = { error: 'prisma_error', message: 'Database error', details: { code: err.code } };
        return res.status(500).json(body);
    }
    // Fallback
    const body = { error: 'internal_error', message: 'An unexpected error occurred' };
    return res.status(500).json(body);
}
//# sourceMappingURL=errors.js.map