// // src/server.ts
// import express, { Request, Response, NextFunction } from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { quizRouter } from './routes/quiz';

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Health check
// app.get('/health', (req: Request, res: Response) => {
//   res.json({ status: 'ok' });
// });

// // Quiz routes
// app.use('/api/quizzes', quizRouter);

// // Global error handler
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// const PORT = process.env.PORT || 4000;

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

import dotenv from 'dotenv';
import { app } from './app';

dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});