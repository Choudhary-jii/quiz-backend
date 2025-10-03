import { z } from 'zod';

export const createQuizSchema = z.object({
title: z.string().min(1).max(200),
});

const optionSchema = z.object({ text: z.string().min(1).max(500), isCorrect: z.boolean().optional() });

export const addQuestionSchema = z.object({
text: z.string().min(1).max(2000),
type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT']),
options: z.array(optionSchema).optional().default([]),
});

export const submitSchema = z.object({
answers: z.array(
z.object({
questionId: z.string().uuid(),
selectedOptionIds: z.array(z.string().uuid()).optional(),
textAnswer: z.string().max(300).optional(),
})
),
});