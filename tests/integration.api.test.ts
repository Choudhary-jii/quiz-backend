// tests/integration.api.test.ts
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/prisma/client';

jest.setTimeout(20000);

beforeAll(async () => {
  // Clean DB in dependency-safe order
  await prisma.submittedAnswer.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Quiz API (integration)', () => {
  it('full flow: create quiz, add questions, fetch questions, submit answers', async () => {
    // 1) Create quiz
    const createQuizRes = await request(app)
      .post('/api/quizzes')
      .send({ title: 'My Java Quiz (integration)' })
      .expect(201);

    const quizId: string = createQuizRes.body.id;
    expect(quizId).toBeDefined();
    expect(createQuizRes.body.title).toBe('My Java Quiz (integration)');

    // 2) Add questions
    // Single choice
    await request(app)
      .post(`/api/quizzes/${quizId}/questions`)
      .send({
        text: 'What happens if an abstract class does not have any abstract methods?',
        type: 'SINGLE_CHOICE',
        options: [
          { text: 'It will not compile.', isCorrect: false },
          { text: 'The class can still be abstract.', isCorrect: true },
          { text: 'Java will automatically provide an abstract method.', isCorrect: false },
          { text: 'It becomes a concrete class.', isCorrect: false },
        ],
      })
      .expect(201);

    // Multiple choice
    await request(app)
      .post(`/api/quizzes/${quizId}/questions`)
      .send({
        text: 'Which of the following are features of Java?',
        type: 'MULTIPLE_CHOICE',
        options: [
          { text: 'Object-oriented', isCorrect: true },
          { text: 'Platform-independent', isCorrect: true },
          { text: ' Use of pointers', isCorrect: false },
          { text: 'Dynamic and Extensible', isCorrect: true },
        ],
      })
      .expect(201);

    // Text question
    await request(app)
      .post(`/api/quizzes/${quizId}/questions`)
      .send({
        text: 'The output of the Java compiler is known as',
        type: 'TEXT',
        options: [],
      })
      .expect(201);

    // 3) Fetch questions (public view)
    const fetchRes = await request(app).get(`/api/quizzes/${quizId}/questions`).expect(200);
    // According to docs, response is { quiz: {...}, questions: [...] }
    const payload = fetchRes.body;
    const questions = Array.isArray(payload) ? payload : payload.questions;
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThanOrEqual(3);

    // Identify questions by text
    const qSingle = questions.find((q: any) =>
      q.text.includes('abstract class does not have any abstract methods')
    );
    const qMulti = questions.find((q: any) => q.text.includes('features of Java'));
    const qText = questions.find((q: any) => q.text.includes('output of the Java compiler'));

    expect(qSingle).toBeDefined();
    expect(qMulti).toBeDefined();
    expect(qText).toBeDefined();

    const singleQuestionId = qSingle.id;
    const multiQuestionId = qMulti.id;
    const textQuestionId = qText.id;

    // 4) Get correct option ids directly from DB (since public GET hides isCorrect)
    const singleOptions = await prisma.option.findMany({ where: { questionId: singleQuestionId } });
    const correctSingle = singleOptions.find(o => o.isCorrect);
    expect(correctSingle).toBeDefined();

    const multiOptions = await prisma.option.findMany({ where: { questionId: multiQuestionId } });
    const correctMulti = multiOptions.filter(o => o.isCorrect).map(o => o.id);
    expect(correctMulti.length).toBeGreaterThanOrEqual(1);

    // 5) Submit answers (we pick correct answers for single & multiple; text gets manual answer)
    const submitPayload = {
      answers: [
        { questionId: singleQuestionId, selectedOptionIds: [correctSingle!.id] },
        { questionId: multiQuestionId, selectedOptionIds: correctMulti },
        { questionId: textQuestionId, textAnswer: 'Byte code' },
      ],
    };

    const submitRes = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .send(submitPayload)
      .expect(200);

    expect(submitRes.body).toHaveProperty('score');
    expect(submitRes.body).toHaveProperty('total');
    expect(submitRes.body).toHaveProperty('details');
    expect(Array.isArray(submitRes.body.details)).toBe(true);

    const { score, total, details } = submitRes.body as {
      score: number;
      total: number;
      details: { questionId: string; correct: boolean; reason?: string }[];
    };

    // total should equal number of questions present (we created 3)
    expect(total).toBeGreaterThanOrEqual(3);

    // text question should be manual-review
    const textDetail = details.find(d => d.questionId === textQuestionId);
    expect(textDetail).toBeDefined();
    expect(textDetail!.reason).toBe('manual-review');

    // single and multiple should be marked correct (we selected the correct options)
    const singleDetail = details.find(d => d.questionId === singleQuestionId);
    const multiDetail = details.find(d => d.questionId === multiQuestionId);

    expect(singleDetail).toBeDefined();
    expect(singleDetail!.correct).toBe(true);

    expect(multiDetail).toBeDefined();
    expect(multiDetail!.correct).toBe(true);

    // Score should be at least 2 (single + multiple), text is manual-review (no auto score)
    expect(score).toBeGreaterThanOrEqual(2);
  });
});
