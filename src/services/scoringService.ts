import type { Question, Option } from '../../generated/prisma/client';

type QuestionWithOptions = Question & { options: Option[] };

type SubmittedAnswerInput = {
questionId: string;
selectedOptionIds?: string[];
textAnswer?: string;
};

export function scoreSubmission(questions: QuestionWithOptions[], answers: SubmittedAnswerInput[]) {
const questionMap = new Map<string, QuestionWithOptions>();
for (const q of questions) questionMap.set(q.id, q);

let score = 0;
const details: { questionId: string; correct: boolean; reason?: string }[] = [];

for (const ans of answers) {
const q = questionMap.get(ans.questionId);
if (!q) {
details.push({ questionId: ans.questionId, correct: false, reason: 'question-not-in-quiz' });
continue;
}

if (q.type === 'SINGLE_CHOICE') {
const correct = q.options.find(o => o.isCorrect);
const selected = ans.selectedOptionIds && ans.selectedOptionIds.length > 0 ? ans.selectedOptionIds[0] : null;
const isCorrect = !!correct && selected === correct.id;
if (isCorrect) score += 1;
details.push({ questionId: q.id, correct: isCorrect });
continue;
}

if (q.type === 'MULTIPLE_CHOICE') {
const correctSet = new Set(q.options.filter(o => o.isCorrect).map(o => o.id));
const selectedSet = new Set(ans.selectedOptionIds || []);
const equal = correctSet.size === selectedSet.size && [...correctSet].every(id => selectedSet.has(id));
if (equal) score += 1;
details.push({ questionId: q.id, correct: equal });
continue;
}

if (q.type === 'TEXT') {
details.push({ questionId: q.id, correct: false, reason: 'manual-review' });
continue;
}
}

const total = questions.length;
return { score, total, details };
}