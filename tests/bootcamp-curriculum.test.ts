import assert from 'node:assert/strict';
import test from 'node:test';
import { BootcampCurriculumInputError, parseBootcampCurriculumInput } from '../src/lib/bootcamp/curriculum-input';

const workspaceId = '11111111-1111-4111-8111-111111111111';

test('curriculum parser keeps quiz/assets data and normalizes a deadline', () => {
  const parsed = parseBootcampCurriculumInput({
    workspaceId,
    title: 'Post-test 1',
    type: 'post_test',
    dueDate: '2026-09-10T19:00',
    quizData: { questions: [{ text: 'Satu?', options: ['A', 'B'], correct: 1 }] },
    assetsJson: [{ title: 'Slide', url: 'https://example.com/slide.pdf' }],
    isPublished: false,
  });

  assert.equal(parsed.type, 'post_test');
  assert.equal(parsed.isPublished, false);
  assert.equal(parsed.dueDate, '2026-09-10T11:00:00.000Z');
  assert.deepEqual(parsed.assetsJson, [{ title: 'Slide', url: 'https://example.com/slide.pdf' }]);
});

test('curriculum parser rejects unsafe video URLs and malformed assets', () => {
  assert.throws(() => parseBootcampCurriculumInput({ workspaceId, title: 'Materi', videoUrl: 'http://example.com/video.mp4' }), BootcampCurriculumInputError);
  assert.throws(() => parseBootcampCurriculumInput({ workspaceId, title: 'Materi', assetsJson: { url: 'https://example.com' } }), BootcampCurriculumInputError);
  assert.throws(() => parseBootcampCurriculumInput({ workspaceId, title: 'Materi', pointsWeight: '101' }), BootcampCurriculumInputError);
});

test('curriculum parser requires a title and valid type', () => {
  assert.throws(() => parseBootcampCurriculumInput({ workspaceId, title: '' }), BootcampCurriculumInputError);
  assert.throws(() => parseBootcampCurriculumInput({ workspaceId, title: 'Materi', type: 'agency' }), BootcampCurriculumInputError);
});
