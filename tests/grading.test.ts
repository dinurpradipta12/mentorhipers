import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateConfiguredScore, calculateLegacyDisplayedScore, roundScore } from '@/lib/bootcamp/grading';

test('legacy displayed score preserves the four-component compatibility formula', () => {
  const result = calculateLegacyDisplayedScore({
    postTest: 80,
    assignment: 70,
    challenge: 60,
    attendance: 100,
    plusPoints: 40,
  });

  assert.equal(result.engagement, 70);
  assert.equal(result.finalScore, 70);
});

test('legacy displayed score rounds only after the engagement and final components', () => {
  const result = calculateLegacyDisplayedScore({
    postTest: 71.11,
    assignment: 88.88,
    challenge: 63.33,
    attendance: 99.99,
    plusPoints: 26.66,
  });

  assert.equal(result.engagement, 63.33);
  assert.equal(result.finalScore, 71.66);
  assert.equal(roundScore(12.345), 12.35);
});

test('scores outside 0-100 are rejected instead of silently clamped', () => {
  assert.throws(
    () => calculateLegacyDisplayedScore({ postTest: 101, assignment: 0, challenge: 0, attendance: 0, plusPoints: 0 }),
    /0-100/,
  );
});

test('future configured grading requires an authoritative 100% config', () => {
  assert.equal(
    calculateConfiguredScore(
      { postTest: 80, assignment: 70, challenge: 90, attendance: 60 },
      { postTest: 25, assignment: 25, challenge: 25, attendance: 25 },
    ),
    75,
  );
  assert.throws(
    () => calculateConfiguredScore(
      { postTest: 80, assignment: 70, challenge: 90, attendance: 60 },
      { postTest: 40, assignment: 40, challenge: 10, attendance: 20 },
    ),
    /100%/,
  );
});
