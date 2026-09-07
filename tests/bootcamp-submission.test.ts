import assert from 'node:assert/strict';
import test from 'node:test';
import { BootcampSubmissionInputError, parseBootcampAssignmentSubmission } from '../src/lib/bootcamp/submissions';

const workspaceId = '11111111-1111-4111-8111-111111111111';
const curriculumId = '22222222-2222-4222-8222-222222222222';

test('assignment submission parser keeps IDs and canonicalizes an HTTPS URL', () => {
  const parsed = parseBootcampAssignmentSubmission({
    workspaceId,
    curriculumId,
    fileLink: 'https://drive.google.com/open?id=example',
  });

  assert.deepEqual(parsed, {
    workspaceId,
    curriculumId,
    fileLink: 'https://drive.google.com/open?id=example',
  });
});

test('assignment submission parser rejects insecure or credential-bearing URLs', () => {
  assert.throws(() => parseBootcampAssignmentSubmission({ workspaceId, curriculumId, fileLink: 'http://example.com/work' }), BootcampSubmissionInputError);
  assert.throws(() => parseBootcampAssignmentSubmission({ workspaceId, curriculumId, fileLink: 'javascript:alert(1)' }), BootcampSubmissionInputError);
  assert.throws(() => parseBootcampAssignmentSubmission({ workspaceId, curriculumId, fileLink: 'https://user:pass@example.com/work' }), BootcampSubmissionInputError);
});

test('assignment submission parser rejects malformed IDs and missing links', () => {
  assert.throws(() => parseBootcampAssignmentSubmission({ workspaceId: 'not-a-uuid', curriculumId, fileLink: 'https://example.com/work' }), BootcampSubmissionInputError);
  assert.throws(() => parseBootcampAssignmentSubmission({ workspaceId, curriculumId, fileLink: '' }), BootcampSubmissionInputError);
});
