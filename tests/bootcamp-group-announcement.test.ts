import test from 'node:test';
import assert from 'node:assert/strict';
import { BootcampAnnouncementInputError, parseBootcampAnnouncementInput } from '../src/lib/bootcamp/announcement-input';
import { BootcampGroupInputError, parseBootcampGroupInput } from '../src/lib/bootcamp/group-input';
import { BootcampQuizTemplateInputError, parseBootcampQuizTemplateInput } from '../src/lib/bootcamp/template-input';

const workspaceId = '11111111-1111-4111-8111-111111111111';
const profileId = '22222222-2222-4222-8222-222222222222';

test('group parser accepts manual membership and deduplicates profile ids', () => {
  const parsed = parseBootcampGroupInput({
    workspaceId,
    name: 'Kelompok A',
    description: 'Kolaborasi',
    profileIds: [profileId, profileId],
  });
  assert.equal(parsed.mode, 'manual');
  assert.deepEqual(parsed.profileIds, [profileId]);
});

test('group parser validates random group count', () => {
  assert.throws(
    () => parseBootcampGroupInput({ workspaceId, mode: 'random', groupCount: 0 }),
    (error: unknown) => error instanceof BootcampGroupInputError,
  );
});

test('announcement parser only accepts HTTPS image sources', () => {
  const parsed = parseBootcampAnnouncementInput({
    workspaceId,
    title: 'Pengumuman',
    imageUrl: 'https://cdn.example.test/announcement.png',
    galleryImages: ['https://cdn.example.test/one.png'],
    isPinned: true,
  });
  assert.equal(parsed.imageUrl, 'https://cdn.example.test/announcement.png');
  assert.equal(parsed.isPinned, true);
  assert.throws(
    () => parseBootcampAnnouncementInput({ workspaceId, title: 'x', imageUrl: 'javascript:alert(1)' }),
    (error: unknown) => error instanceof BootcampAnnouncementInputError,
  );
});

test('quiz template parser keeps answer keys only in the admin template shape', () => {
  const parsed = parseBootcampQuizTemplateInput({
    title: 'Template dasar',
    category: 'General',
    questionsJson: [{ id: 1, text: '2 + 2?', type: 'mc', options: ['3', '4'], correct: 1 }],
  });
  assert.equal(parsed.questionsJson[0].correct, 1);
  assert.throws(
    () => parseBootcampQuizTemplateInput({ title: 'Tidak valid', questionsJson: [{ text: 'x', type: 'mc', options: ['a', 'b'] }] }),
    (error: unknown) => error instanceof BootcampQuizTemplateInputError,
  );
});
