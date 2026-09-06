import assert from 'node:assert/strict';
import test from 'node:test';
import { hasPlatformAdminRole } from '../src/lib/auth/roles';

test('only platform admin or mentor assignments grant administrator capability', () => {
  assert.equal(hasPlatformAdminRole([]), false);
  assert.equal(hasPlatformAdminRole(['student']), false);
  assert.equal(hasPlatformAdminRole(['admin']), true);
  assert.equal(hasPlatformAdminRole(['mentor']), true);
});

test('legacy-like profile labels cannot be smuggled in as an administrator assignment', () => {
  assert.equal(hasPlatformAdminRole(['legacy_admin']), false);
  assert.equal(hasPlatformAdminRole(['Admin']), false);
  assert.equal(hasPlatformAdminRole(['user', 'student']), false);
});
