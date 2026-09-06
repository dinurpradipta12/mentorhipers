import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeQuizDataForStudent } from '@/lib/bootcamp/quiz';

test('student quiz payload removes answer keys while preserving question choices', () => {
  const sanitized = sanitizeQuizDataForStudent({
    questions: [
      { text: 'Satu?', options: ['A', 'B'], correct: 1, explanation: 'B benar' },
      { text: 'Jelaskan', type: 'essay', answer: 'rahasia' },
    ],
  }) as { questions: Array<Record<string, unknown>> };

  assert.deepEqual(sanitized.questions[0], { text: 'Satu?', options: ['A', 'B'] });
  assert.deepEqual(sanitized.questions[1], { text: 'Jelaskan', type: 'essay' });
});

test('non-object quiz data is returned without coercion', () => {
  assert.equal(sanitizeQuizDataForStudent(null), null);
  assert.deepEqual(sanitizeQuizDataForStudent(['not-a-quiz']), ['not-a-quiz']);
});
