const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BootcampCurriculumInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BootcampCurriculumInputError';
  }
}

export type BootcampCurriculumInput = {
  workspaceId: string;
  title: string;
  description: string | null;
  contentRich: string | null;
  type: 'material' | 'assignment' | 'challenge' | 'group_assignment' | 'post_test';
  moduleName: string | null;
  dueDate: string | null;
  videoUrl: string | null;
  quizData: unknown;
  assetsJson: unknown;
  isPublished: boolean;
  pointsWeight: string | null;
  gradingMode: 'auto' | 'manual';
  assignmentGroupId: string | null;
};

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BootcampCurriculumInputError(`${label} tidak valid.`);
  return value as Record<string, unknown>;
}

function uuid(value: unknown, label: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) throw new BootcampCurriculumInputError(`${label} tidak valid.`);
  return value;
}

function text(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== 'string') throw new BootcampCurriculumInputError(`${label} wajib diisi.`);
  const normalized = value.trim();
  if (!normalized) throw new BootcampCurriculumInputError(`${label} wajib diisi.`);
  if (normalized.length > maxLength) throw new BootcampCurriculumInputError(`${label} terlalu panjang.`);
  return normalized;
}

function optionalText(value: unknown, label: string, maxLength: number): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new BootcampCurriculumInputError(`${label} tidak valid.`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new BootcampCurriculumInputError(`${label} terlalu panjang.`);
  return normalized || null;
}

function optionalUrl(value: unknown, label: string): string | null {
  const candidate = optionalText(value, label, 2_000);
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('unsafe');
    return parsed.toString();
  } catch {
    throw new BootcampCurriculumInputError(`${label} harus berupa URL HTTPS yang valid.`);
  }
}

function optionalDate(value: unknown): string | null {
  const candidate = optionalText(value, 'Deadline', 80);
  if (!candidate) return null;
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) throw new BootcampCurriculumInputError('Deadline tidak valid.');
  return parsed.toISOString();
}

function safeJson(value: unknown, label: string, depth = 0): unknown {
  if (depth > 6) throw new BootcampCurriculumInputError(`${label} terlalu dalam.`);
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new BootcampCurriculumInputError(`${label} memiliki angka tidak valid.`);
    return value;
  }
  if (typeof value === 'string') {
    if (value.length > 20_000) throw new BootcampCurriculumInputError(`${label} terlalu panjang.`);
    return value.replace(/\u0000/g, '');
  }
  if (Array.isArray(value)) {
    if (value.length > 200) throw new BootcampCurriculumInputError(`${label} memiliki terlalu banyak item.`);
    return value.map((item) => safeJson(item, label, depth + 1));
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length > 200) throw new BootcampCurriculumInputError(`${label} memiliki terlalu banyak field.`);
    return Object.fromEntries(entries.map(([key, item]) => {
      if (!key || key.length > 180) throw new BootcampCurriculumInputError(`${label} memiliki nama field tidak valid.`);
      return [key, safeJson(item, label, depth + 1)];
    }));
  }
  throw new BootcampCurriculumInputError(`${label} memiliki nilai tidak valid.`);
}

export function parseBootcampCurriculumInput(value: unknown): BootcampCurriculumInput {
  const input = record(value, 'Data curriculum');
  const rawType = input.type === undefined ? 'material' : input.type;
  if (rawType !== 'material' && rawType !== 'assignment' && rawType !== 'challenge' && rawType !== 'group_assignment' && rawType !== 'post_test') {
    throw new BootcampCurriculumInputError('Jenis curriculum tidak valid.');
  }
  const rawPublished = input.isPublished;
  if (rawPublished !== undefined && typeof rawPublished !== 'boolean') throw new BootcampCurriculumInputError('Status publikasi tidak valid.');
  const rawGradingMode = input.gradingMode === undefined ? 'auto' : input.gradingMode;
  if (rawGradingMode !== 'auto' && rawGradingMode !== 'manual') throw new BootcampCurriculumInputError('Mode penilaian tidak valid.');

  const rawPointsWeight = optionalText(input.pointsWeight, 'Bobot nilai', 20);
  if (rawPointsWeight !== null) {
    const numeric = Number(rawPointsWeight);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) throw new BootcampCurriculumInputError('Bobot nilai harus berada pada rentang 0–100.');
  }
  const assignmentGroupId = input.assignmentGroupId === null || input.assignmentGroupId === undefined || input.assignmentGroupId === ''
    ? null
    : uuid(input.assignmentGroupId, 'Grup assignment');
  const quizData = input.quizData === undefined ? {} : safeJson(input.quizData, 'Quiz data');
  const assetsJson = input.assetsJson === undefined ? [] : safeJson(input.assetsJson, 'Assets');
  if (!Array.isArray(assetsJson)) throw new BootcampCurriculumInputError('Assets harus berupa JSON array.');

  return {
    workspaceId: uuid(input.workspaceId, 'Batch'),
    title: text(input.title, 'Judul curriculum', 180),
    description: optionalText(input.description, 'Deskripsi curriculum', 12_000),
    contentRich: optionalText(input.contentRich, 'Konten curriculum', 50_000),
    type: rawType,
    moduleName: optionalText(input.moduleName, 'Nama modul', 180),
    dueDate: optionalDate(input.dueDate),
    videoUrl: optionalUrl(input.videoUrl, 'URL video'),
    quizData,
    assetsJson,
    isPublished: rawPublished ?? true,
    pointsWeight: rawPointsWeight,
    gradingMode: rawGradingMode,
    assignmentGroupId,
  };
}
