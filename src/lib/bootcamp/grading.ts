/**
 * Read-only compatibility calculator for comparing the legacy UI's displayed
 * score. It must not be used to overwrite historical grades: the live schema
 * currently has no authoritative `grading_config`.
 */
export type LegacyScoreInput = {
  postTest: number;
  assignment: number;
  challenge: number;
  attendance: number;
  plusPoints: number;
};

export type LegacyScoreBreakdown = LegacyScoreInput & {
  engagement: number;
  finalScore: number;
};

export type GradingConfig = {
  postTest: number;
  assignment: number;
  challenge: number;
  attendance: number;
};

function score(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(`${label} harus berupa angka 0-100.`);
  }
  return value;
}

/** Round to two decimal places using the same clear 0–100 unit everywhere. */
export function roundScore(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Mirrors the formula displayed by both legacy Bootcamp layouts:
 * final = average(post-test, assignment, challenge,
 *                 average(attendance, plus points)).
 */
export function calculateLegacyDisplayedScore(input: LegacyScoreInput): LegacyScoreBreakdown {
  const postTest = score(input.postTest, 'Nilai post-test');
  const assignment = score(input.assignment, 'Nilai assignment');
  const challenge = score(input.challenge, 'Nilai challenge');
  const attendance = score(input.attendance, 'Nilai attendance');
  const plusPoints = score(input.plusPoints, 'Plus points');
  const engagement = roundScore((attendance + plusPoints) / 2);
  const finalScore = roundScore((postTest + assignment + challenge + engagement) / 4);
  return { postTest, assignment, challenge, attendance, plusPoints, engagement, finalScore };
}

/**
 * A future database-backed `grading_config` may use a weighted formula only
 * after it becomes the approved source of truth. This helper makes the
 * validation and rounding rules explicit without selecting a default.
 */
export function calculateConfiguredScore(input: Omit<LegacyScoreInput, 'plusPoints'>, config: GradingConfig): number {
  const normalized = {
    postTest: score(input.postTest, 'Nilai post-test'),
    assignment: score(input.assignment, 'Nilai assignment'),
    challenge: score(input.challenge, 'Nilai challenge'),
    attendance: score(input.attendance, 'Nilai attendance'),
  };
  const weights = {
    postTest: score(config.postTest, 'Bobot post-test'),
    assignment: score(config.assignment, 'Bobot assignment'),
    challenge: score(config.challenge, 'Bobot challenge'),
    attendance: score(config.attendance, 'Bobot attendance'),
  };
  const totalWeight = Object.values(weights).reduce((total, value) => total + value, 0);
  if (roundScore(totalWeight) !== 100) throw new RangeError('Total bobot grading_config harus tepat 100%.');
  return roundScore((
    normalized.postTest * weights.postTest +
    normalized.assignment * weights.assignment +
    normalized.challenge * weights.challenge +
    normalized.attendance * weights.attendance
  ) / 100);
}
