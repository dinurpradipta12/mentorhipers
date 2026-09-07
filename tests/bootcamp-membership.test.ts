import assert from 'node:assert/strict';
import test from 'node:test';
import { BootcampMembershipInputError, parseBootcampMembershipPatch } from '../src/lib/bootcamp/membership-input';

const workspaceId = '11111111-1111-4111-8111-111111111111';

test('membership patch accepts group, leader, credential, and attendance fields', () => {
  const parsed = parseBootcampMembershipPatch({
    workspaceId,
    role: 'member',
    groupName: 'Kelompok A',
    groupWaLink: 'https://chat.whatsapp.com/example',
    isLeader: true,
    credentialNo: 'RC-001',
    certificateUrl: 'https://files.example.com/certificate.pdf',
    attendance: { '2026-09-10': 'P' },
    plusPoints: { kontribusi: 5.4 },
  });

  assert.equal(parsed.groupName, 'Kelompok A');
  assert.equal(parsed.isLeader, true);
  assert.deepEqual(parsed.attendance, { '2026-09-10': 'P' });
  assert.deepEqual(parsed.plusPoints, { kontribusi: 5 });
});

test('membership patch supports soft revoke and rejects unsafe URLs', () => {
  assert.equal(parseBootcampMembershipPatch({ workspaceId, role: 'removed' }).role, 'removed');
  assert.throws(() => parseBootcampMembershipPatch({ workspaceId, groupWaLink: 'http://chat.whatsapp.com/example' }), BootcampMembershipInputError);
  assert.throws(() => parseBootcampMembershipPatch({ workspaceId, certificateUrl: 'https://user:pass@example.com/cert' }), BootcampMembershipInputError);
});

test('membership patch requires a real change and valid booleans', () => {
  assert.throws(() => parseBootcampMembershipPatch({ workspaceId }), BootcampMembershipInputError);
  assert.throws(() => parseBootcampMembershipPatch({ workspaceId, isLeader: 'yes' }), BootcampMembershipInputError);
});
