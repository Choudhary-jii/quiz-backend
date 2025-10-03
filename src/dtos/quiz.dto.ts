// DTOs describe exactly what we return to clients
export type OptionDTO = {
id: string;
text: string;
};

export type QuestionDTO = {
id: string;
text: string;
type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT';
options: OptionDTO[];
};

export type QuizDTO = {
id: string;
title: string;
};

export type QuizWithQuestionsDTO = {
quiz: QuizDTO;
questions: QuestionDTO[];
};