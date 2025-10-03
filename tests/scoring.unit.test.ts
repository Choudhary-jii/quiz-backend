// // // tests/scoring.unit.test.ts
// // import { scoreSubmission } from '../src/services/scoringService';

// // function makeOption(id: string, isCorrect = false) {
// //   return { id, questionId: 'q', text: 'opt', isCorrect };
// // }

// // function makeQuestion(id: string, type: any, options: any[] = []) {
// //   return { id, quizId: 'quiz1', text: 'q', type, options };
// // }

// // describe('scoreSubmission (unit)', () => {
// //   test('single choice correct and incorrect', () => {
// //     const q = makeQuestion('q1', 'SINGLE_CHOICE', [makeOption('o1', false), makeOption('o2', true)]);
// //     const resCorrect = scoreSubmission([q], [{ questionId: 'q1', selectedOptionIds: ['o2'] }]);
// //     expect(resCorrect.score).toBe(1);
// //     expect(resCorrect.total).toBe(1);
// //     const resWrong = scoreSubmission([q], [{ questionId: 'q1', selectedOptionIds: ['o1'] }]);
// //     expect(resWrong.score).toBe(0);
// //     expect(resWrong.total).toBe(1);
// //   });

// //   test('multiple choice full match vs partial', () => {
// //     const q = makeQuestion(
// //       'q2',
// //       'MULTIPLE_CHOICE',
// //       [makeOption('o1', true), makeOption('o2', true), makeOption('o3', false)]
// //     );
// //     const full = scoreSubmission([q], [{ questionId: 'q2', selectedOptionIds: ['o1', 'o2'] }]);
// //     expect(full.score).toBe(1);
// //     expect(full.total).toBe(1);

// //     const partial = scoreSubmission([q], [{ questionId: 'q2', selectedOptionIds: ['o1'] }]);
// //     expect(partial.score).toBe(0);
// //     expect(partial.total).toBe(1);

// //     const extraWrong = scoreSubmission([q], [{ questionId: 'q2', selectedOptionIds: ['o1', 'o2', 'o3'] }]);
// //     expect(extraWrong.score).toBe(0);
// //     expect(extraWrong.total).toBe(1);
// //   });

// //   test('text question flagged for manual review', () => {
// //     const q = makeQuestion('q3', 'TEXT', []);
// //     const res = scoreSubmission([q], [{ questionId: 'q3', textAnswer: 'some answer' }]);
// //     expect(res.score).toBe(0);
// //     expect(res.details[0].reason).toBe('manual-review');
// //     expect(res.total).toBe(1);
// //   });

// //   test('unknown question id is ignored/flagged', () => {
// //     const q = makeQuestion('q4', 'SINGLE_CHOICE', [makeOption('o1', true)]);
// //     const res = scoreSubmission([q], [{ questionId: 'non-existent', selectedOptionIds: ['o1'] }]);
// //     expect(res.score).toBe(0);
// //     expect(res.details[0].reason).toBe('question-not-in-quiz');
// //     expect(res.total).toBe(1);
// //   });
// // });


// import { scoreSubmission } from '../src/services/scoringService';
// import { QuestionType } from '../generated/prisma';

// function makeOption(id: string, isCorrect = false) {
//   return { id, questionId: 'q', text: 'opt', isCorrect };
// }

// function makeQuestion(id: string, type: QuestionType, options: any[] = []) {
//   return { id, quizId: 'quiz1', text: 'q', type, options, createdAt: new Date() };
// }

// describe('scoreSubmission (unit)', () => {
//   test('single choice correct and incorrect', () => {
//     const q = makeQuestion('q1', QuestionType.SINGLE_CHOICE, [
//       makeOption('o1', false),
//       makeOption('o2', true),
//     ]);
//     const resCorrect = scoreSubmission([q], [{ questionId: 'q1', selectedOptionIds: ['o2'] }]);
//     expect(resCorrect.score).toBe(1);
//     expect(resCorrect.total).toBe(1);

//     const resWrong = scoreSubmission([q], [{ questionId: 'q1', selectedOptionIds: ['o1'] }]);
//     expect(resWrong.score).toBe(0);
//     expect(resWrong.total).toBe(1);
//   });

//   test('multiple choice full match vs partial', () => {
//     const q = makeQuestion('q2', QuestionType.MULTIPLE_CHOICE, [
//       makeOption('o1', true),
//       makeOption('o2', true),
//       makeOption('o3', false),
//     ]);
//     const full = scoreSubmission([q], [{ questionId: 'q2', selectedOptionIds: ['o1', 'o2'] }]);
//     expect(full.score).toBe(1);
//     expect(full.total).toBe(1);

//     const partial = scoreSubmission([q], [{ questionId: 'q2', selectedOptionIds: ['o1'] }]);
//     expect(partial.score).toBe(0);
//     expect(partial.total).toBe(1);

//     const extraWrong = scoreSubmission([q], [{ questionId: 'q2', selectedOptionIds: ['o1', 'o2', 'o3'] }]);
//     expect(extraWrong.score).toBe(0);
//     expect(extraWrong.total).toBe(1);
//   });

//   test('text question flagged for manual review', () => {
//     const q = makeQuestion('q3', QuestionType.TEXT, []);
//     const res = scoreSubmission([q], [{ questionId: 'q3', textAnswer: 'some answer' }]);
//     expect(res.score).toBe(0);
//     expect(res.details[0].reason).toBe('manual-review');
//     expect(res.total).toBe(1);
//   });

//   test('unknown question id is ignored/flagged', () => {
//     const q = makeQuestion('q4', QuestionType.SINGLE_CHOICE, [makeOption('o1', true)]);
//     const res = scoreSubmission([q], [{ questionId: 'non-existent', selectedOptionIds: ['o1'] }]);
//     expect(res.score).toBe(0);
//     expect(res.details[0].reason).toBe('question-not-in-quiz');
//     expect(res.total).toBe(1);
//   });
// });


// tests/scoring.unit.test.ts
import { scoreSubmission } from '../src/services/scoringService';
import { QuestionType, Option } from '../generated/prisma';

// Helper to create mock options
function makeOption(id: string, isCorrect = false): Option {
  return {
    id,
    questionId: 'q',
    text: 'opt',
    isCorrect,
  };
}

// Helper to create mock questions
function makeQuestion(
  id: string,
  type: QuestionType,
  options: Option[] = []
) {
  return {
    id,
    quizId: 'quiz1',
    text: 'q',
    type,
    createdAt: new Date(), // ✅ required by Prisma type
    options,
  };
}

describe('scoreSubmission (unit)', () => {
  test('single choice correct and incorrect', () => {
    const q = makeQuestion('q1', QuestionType.SINGLE_CHOICE, [
      makeOption('o1', false),
      makeOption('o2', true),
    ]);

    const resCorrect = scoreSubmission([q], [
      { questionId: 'q1', selectedOptionIds: ['o2'] },
    ]);
    expect(resCorrect.score).toBe(1);
    expect(resCorrect.total).toBe(1);

    const resWrong = scoreSubmission([q], [
      { questionId: 'q1', selectedOptionIds: ['o1'] },
    ]);
    expect(resWrong.score).toBe(0);
    expect(resWrong.total).toBe(1);
  });

  test('multiple choice full match vs partial', () => {
    const q = makeQuestion('q2', QuestionType.MULTIPLE_CHOICE, [
      makeOption('o1', true),
      makeOption('o2', true),
      makeOption('o3', false),
    ]);

    const full = scoreSubmission([q], [
      { questionId: 'q2', selectedOptionIds: ['o1', 'o2'] },
    ]);
    expect(full.score).toBe(1);
    expect(full.total).toBe(1);

    const partial = scoreSubmission([q], [
      { questionId: 'q2', selectedOptionIds: ['o1'] },
    ]);
    expect(partial.score).toBe(0);
    expect(partial.total).toBe(1);

    const extraWrong = scoreSubmission([q], [
      { questionId: 'q2', selectedOptionIds: ['o1', 'o2', 'o3'] },
    ]);
    expect(extraWrong.score).toBe(0);
    expect(extraWrong.total).toBe(1);
  });

  test('text question flagged for manual review', () => {
    const q = makeQuestion('q3', QuestionType.TEXT, []);
    const res = scoreSubmission([q], [
      { questionId: 'q3', textAnswer: 'some answer' },
    ]);
    expect(res.score).toBe(0);
    expect(res.details[0].reason).toBe('manual-review');
    expect(res.total).toBe(1);
  });

  test('unknown question id is ignored/flagged', () => {
    const q = makeQuestion('q4', QuestionType.SINGLE_CHOICE, [
      makeOption('o1', true),
    ]);
    const res = scoreSubmission([q], [
      { questionId: 'non-existent', selectedOptionIds: ['o1'] },
    ]);
    expect(res.score).toBe(0);
    expect(res.details[0].reason).toBe('question-not-in-quiz');
    expect(res.total).toBe(1);
  });
});
