import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema<any>) {
return (req: Request, res: Response, next: NextFunction) => {
const parsed = schema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
// attach parsed data to request for type-safety in controllers
(req as any).validatedBody = parsed.data;
next();
};
}