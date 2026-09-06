const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BootcampInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BootcampInputError';
  }
}

export function isBootcampUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

type ParsedSubmissionGradeUpdate = {
  workspaceId: string;
  submissionId: string;
  setGrade: boolean;
  grade: number | null;
  setStatus: boolean;
  status: 'pending' | 'in_review' | 'completed' | null;
  setFeedback: boolean;
  feedback: string | null;
  setCriteriaScores: boolean;
  criteriaScores: Record<string, number> | null;
  reason: string | null;
};

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BootcampInputError('Data permintaan tidak valid.');
  return value as Record<string, unknown>;
}

function uuid(value: unknown, label: string): string {
  if (!isBootcampUuid(value)) throw new BootcampInputError(label + ' tidak valid.');
  return value;
}

function text(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== 'string') throw new BootcampInputError(label + ' wajib diisi.');
  const normalized = value.trim();
  if (!normalized) throw new BootcampInputError(label + ' wajib diisi.');
  if (normalized.length > maxLength) throw new BootcampInputError(label + ' terlalu panjang.');
  return normalized;
}

function optionalText(value: unknown, label: string, maxLength: number): string | null {
  if (value === null || value === undefined || value === '') return null;
  return text(value, label, maxLength);
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

/**
 * Grades use the explicit 0–100 scale. Decimal input is rounded once using
 * Math.round before it is written, while omitted fields are left unchanged.
 */
export function parseSubmissionGradeUpdate(value: unknown): ParsedSubmissionGradeUpdate {
  const input = record(value);
  const workspaceId = uuid(input.workspaceId, 'Batch');
  const submissionId = uuid(input.submissionId, 'Submission');

  const setGrade = hasOwn(input, 'grade');
  let grade: number | null = null;
  if (setGrade && input.grade !== null) {
    const numeric = typeof input.grade === 'number' ? input.grade : Number(input.grade);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) throw new BootcampInputError('Nilai harus berada pada rentang 0–100.');
    grade = Math.round(numeric);
  }

  const setStatus = hasOwn(input, 'status');
  let status: ParsedSubmissionGradeUpdate['status'] = null;
  if (setStatus) {
    const candidate = text(input.status, 'Status submission', 32);
    if (candidate !== 'pending' && candidate !== 'in_review' && candidate !== 'completed') throw new BootcampInputError('Status submission tidak valid.');
    status = candidate;
  }

  const setFeedback = hasOwn(input, 'mentorFeedback');
  const feedback = setFeedback ? optionalText(input.mentorFeedback, 'Feedback mentor', 10_000) : null;

  const setCriteriaScores = hasOwn(input, 'criteriaScores');
  let criteriaScores: Record<string, number> | null = null;
  if (setCriteriaScores && input.criteriaScores !== null) {
    const criteria = record(input.criteriaScores);
    const entries = Object.entries(criteria);
    if (entries.length > 50) throw new BootcampInputError('Maksimal 50 kriteria dapat dinilai.');
    criteriaScores = {};
    for (const [criterion, rawScore] of entries) {
      const name = text(criterion, 'Nama kriteria', 180);
      const numeric = typeof rawScore === 'number' ? rawScore : Number(rawScore);
      if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) throw new BootcampInputError('Nilai kriteria ' + name + ' harus berada pada rentang 0–100.');
      criteriaScores[name] = Math.round(numeric);
    }
  }

  const reason = optionalText(input.reason, 'Catatan perubahan', 1_000);
  if (!setGrade && !setStatus && !setFeedback && !setCriteriaScores) throw new BootcampInputError('Pilih setidaknya satu perubahan nilai, status, feedback, atau kriteria.');

  return {
    workspaceId,
    submissionId,
    setGrade,
    grade,
    setStatus,
    status,
    setFeedback,
    feedback,
    setCriteriaScores,
    criteriaScores,
    reason,
  };
}
