import assert from 'node:assert/strict';
import test from 'node:test';
import { BootcampInputError, parseSubmissionGradeUpdate } from '../src/lib/bootcamp/grade-input';

const workspaceId = '11111111-1111-4111-8111-111111111111';
const submissionId = '22222222-2222-4222-8222-222222222222';

test('explicit submission grading rounds once on the 0-100 scale and keeps criteria scores', () => {
  const update = parseSubmissionGradeUpdate({
    workspaceId,
    submissionId,
    grade: 87.5,
    status: 'completed',
    mentorFeedback: 'Sudah memenuhi rubrik.',
    criteriaScores: { Kejelasan: 90, Kelengkapan: 84.6 },
    reason: 'Penilaian akhir mentor',
  });

  assert.equal(update.grade, 88);
  assert.equal(update.status, 'completed');
  assert.deepEqual(update.criteriaScores, { Kejelasan: 90, Kelengkapan: 85 });
  assert.equal(update.setGrade, true);
  assert.equal(update.setStatus, true);
  assert.equal(update.setFeedback, true);
  assert.equal(update.setCriteriaScores, true);
});

test('grading changes reject scores outside 0-100 and unsupported status', () => {
  assert.throws(() => parseSubmissionGradeUpdate({ workspaceId, submissionId, grade: 100.1 }), BootcampInputError);
  assert.throws(() => parseSubmissionGradeUpdate({ workspaceId, submissionId, criteriaScores: { Rubrik: -1 } }), BootcampInputError);
  assert.throws(() => parseSubmissionGradeUpdate({ workspaceId, submissionId, status: 'published' }), BootcampInputError);
});

test('grading update requires an explicit field so historic values are not overwritten by an empty request', () => {
  assert.throws(() => parseSubmissionGradeUpdate({ workspaceId, submissionId }), BootcampInputError);
});
