// src/controllers/quizController.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { createQuizSchema, addQuestionSchema, submitSchema } from '../validators/schemas';
import { toQuizDTO, toQuestionDTO, toQuizWithQuestionsDTO } from '../mappers/quiz.mapper';
import { scoreSubmission } from '../services/scoringService';

export async function createQuiz(req: Request, res: Response) {
  const parsed = createQuizSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

  try {
    const quiz = await prisma.quiz.create({ data: { title: parsed.data.title } });
    return res.status(201).json(toQuizDTO(quiz));
  } catch (err: any) {
    console.error('createQuiz error', err);
    return res.status(500).json({ error: 'Failed to create quiz' });
  }
}

export async function listQuizzes(req: Request, res: Response) {
  try {
    const quizzes = await prisma.quiz.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(quizzes.map(toQuizDTO));
  } catch (err: any) {
    console.error('listQuizzes error', err);
    return res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
}

export async function addQuestion(req: Request, res: Response) {
  const quizId = req.params.quizId;
  const parsed = addQuestionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const { text, type, options } = parsed.data;

    // Business validations
    if (type === 'TEXT' && options.length > 0) {
      return res.status(400).json({ error: 'Text questions must not have options' });
    }

    if (type === 'SINGLE_CHOICE') {
      if (options.length < 2) return res.status(400).json({ error: 'Single choice must have at least 2 options' });
      const correctCount = options.filter((o: any) => o.isCorrect).length;
      if (correctCount !== 1) return res.status(400).json({ error: 'Single choice must have exactly 1 correct option' });
    }

    if (type === 'MULTIPLE_CHOICE') {
      if (options.length < 2) return res.status(400).json({ error: 'Multiple choice must have at least 2 options' });
      const correctCount = options.filter((o: any) => o.isCorrect).length;
      if (correctCount < 1) return res.status(400).json({ error: 'Multiple choice must have at least 1 correct option' });
    }

    // create question and options atomically
    // const createdQuestion = await prisma.$transaction(async tx => {
    //   const q = await tx.question.create({ data: { quizId, text, type } });
    //   if (options && options.length) {
    //     const mapped = options.map((o: any) => ({ questionId: q.id, text: o.text, isCorrect: !!o.isCorrect }));
    //     // createMany doesn't return rows, so we will re-fetch below
    //     await tx.option.createMany({ data: mapped });
    //   }
    //   return tx.question.findUnique({ where: { id: q.id }, include: { options: true } }) as any;
    // });

      const createdQuestion = await prisma.$transaction(async tx => {
          const q = await tx.question.create({ data: { quizId, text, type } });

          if (options && options.length) {
              const createdOptions = await Promise.all(
                  options.map(o =>
                      tx.option.create({ data: { questionId: q.id, text: o.text, isCorrect: !!o.isCorrect } })
                  )
              );
            //   return tx.question.findUnique({ where: { id: q.id }, include: { options: true } }) as any;
          }

          return tx.question.findUnique({ where: { id: q.id }, include: { options: true } }) as any;
});


    // Re-fetch created question (if transaction returned undefined, fetch directly)
    const qWithOptions = createdQuestion ?? await prisma.question.findUnique({ where: { id: createdQuestion.id }, include: { options: true } });

    return res.status(201).json(toQuestionDTO(qWithOptions));
  } catch (err: any) {
    console.error('addQuestion error', err);
    return res.status(500).json({ error: 'Failed to add question' });
  }
}

export async function getQuizQuestions(req: Request, res: Response) {
  const quizId = req.params.quizId;
  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const questions = await prisma.question.findMany({
      where: { quizId },
      include: { options: true },
      orderBy: { createdAt: 'asc' },
    });

    const dto = toQuizWithQuestionsDTO(quiz, questions);
    return res.json(dto);
  } catch (err: any) {
    console.error('getQuizQuestions error', err);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }
}

// export async function submitQuiz(req: Request, res: Response) {
//   const quizId = req.params.quizId;
//   const parsed = submitSchema.safeParse(req.body);
//   if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

//   try {
//     const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
//     if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

//     // fetch questions + options for scoring
//     const questions = await prisma.question.findMany({ where: { quizId }, include: { options: true } });

//     const { score, total, details } = scoreSubmission(questions, parsed.data.answers);

//     // persist submission and answers
//     const created = await prisma.submission.create({
//       data: {
//         quizId,
//         score,
//         total,
//         answers: {
//           create: parsed.data.answers.map((a: any) => ({
//             questionId: a.questionId,
//             selectedOptionIds: a.selectedOptionIds ? a.selectedOptionIds : undefined,
//             textAnswer: a.textAnswer ?? undefined,
//           })),
//         },
//       },
//       include: { answers: true },
//     });

//     return res.json({ score, total, details, submissionId: created.id });
//   } catch (err: any) {
//     console.error('submitQuiz error', err);
//     return res.status(500).json({ error: 'Failed to submit answers' });
//   }
// }


export async function submitQuiz(req: Request, res: Response) {
  const quizId = req.params.quizId;
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });

  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // fetch questions + options for scoring
    const questions = await prisma.question.findMany({
      where: { quizId },
      include: { options: true },
    });

    const { score, total, details } = scoreSubmission(questions, parsed.data.answers);

    // Build a Set of valid question IDs for this quiz
    const validQuestionIds = new Set(questions.map((q) => q.id));

    // Filter answers to only persist those that reference a valid questionId.
    // We still return scoring 'details' for all answers (including invalid ones).
    const answersToPersist = parsed.data.answers
      .filter((a: any) => validQuestionIds.has(a.questionId))
      .map((a: any) => ({
        questionId: a.questionId,
        // store selectedOptionIds as JSON if present, otherwise leave undefined
        selectedOptionIds: a.selectedOptionIds ? a.selectedOptionIds : undefined,
        textAnswer: a.textAnswer ?? undefined,
      }));

    // Persist submission and valid answers only
    const created = await prisma.submission.create({
      data: {
        quizId,
        score,
        total,
        answers: {
          create: answersToPersist,
        },
      },
      include: { answers: true },
    });

    return res.json({ score, total, details, submissionId: created.id });
  } catch (err: any) {
    console.error('submitQuiz error', err);
    return res.status(500).json({ error: 'Failed to submit answers' });
  }
}