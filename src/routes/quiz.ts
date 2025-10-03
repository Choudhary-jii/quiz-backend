// src/routes/quiz.ts
import { Router } from 'express';
import { validateBody } from '../middleware/validateRequest';
import { createQuizSchema, addQuestionSchema, submitSchema } from '../validators/schemas';
import {
  createQuiz,
  listQuizzes,
  addQuestion,
  getQuizQuestions,
  submitQuiz,
} from '../controllers/quizController';

export const quizRouter = Router();

// Create a quiz
quizRouter.post('/', validateBody(createQuizSchema), createQuiz);

// List all quizzes (bonus)
quizRouter.get('/', listQuizzes);

// Add question to a quiz
quizRouter.post('/:quizId/questions', validateBody(addQuestionSchema), addQuestion);

// Get questions for a quiz (public, without correct flags)
quizRouter.get('/:quizId/questions', getQuizQuestions);

// Submit answers for a quiz
quizRouter.post('/:quizId/submit', validateBody(submitSchema), submitQuiz);
