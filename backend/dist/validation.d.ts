import { z } from 'zod';
export declare const taskCreateSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const taskUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    completed: z.ZodOptional<z.ZodBoolean>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const listQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    pageSize: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    completed: z.ZodOptional<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>;
    dueBefore: z.ZodOptional<z.ZodString>;
    dueAfter: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<{
        title: "title";
        dueDate: "dueDate";
        completed: "completed";
        createdAt: "createdAt";
    }>>;
    sortOrder: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export declare function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): {
    ok: false;
    details: {
        path: string;
        message: string;
    }[];
    data?: never;
} | {
    ok: true;
    data: z.infer<T>;
    details?: never;
};
export declare function parseQuery<T extends z.ZodTypeAny>(schema: T, query: unknown): {
    ok: false;
    details: {
        path: string;
        message: string;
    }[];
    data?: never;
} | {
    ok: true;
    data: z.infer<T>;
    details?: never;
};
//# sourceMappingURL=validation.d.ts.map