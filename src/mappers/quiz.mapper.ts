import { QuizDTO, QuestionDTO, OptionDTO } from '../dtos/quiz.dto';

export function toQuizDTO(row: any): QuizDTO {
return { id: row.id, title: row.title };
}

export function toQuestionDTO(row: any): QuestionDTO {
// row.options should exist
const options: OptionDTO[] = (row.options || []).map((o: any) => ({ id: o.id, text: o.text }));
return { id: row.id, text: row.text, type: row.type, options };
}

export function toQuizWithQuestionsDTO(quiz: any, questions: any[]) {
return { quiz: toQuizDTO(quiz), questions: questions.map(toQuestionDTO) };
}