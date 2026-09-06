/**
 * Remove answer keys before quiz content is serialized into a student's
 * Server Component props. The database RPC remains the only source of score.
 */
export function sanitizeQuizDataForStudent(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  const quiz = value as Record<string, unknown>;
  const questions = Array.isArray(quiz.questions)
    ? quiz.questions.map((question) => {
        if (!question || typeof question !== 'object' || Array.isArray(question)) return question;
        return Object.fromEntries(
          Object.entries(question as Record<string, unknown>)
            .filter(([key]) => !['correct', 'answer', 'correct_answer', 'isCorrect', 'explanation'].includes(key)),
        );
      })
    : quiz.questions;
  return { ...quiz, questions };
}
