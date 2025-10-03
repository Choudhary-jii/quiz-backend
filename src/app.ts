// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { json } from 'express';
import { quizRouter } from './routes/quiz';

export const app = express();

// Middleware
app.use(cors());
app.use(json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Mount API routes
app.use('/api/quizzes', quizRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err?.status || 500).json({ error: err?.message || 'Internal error' });
});
