const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BootcampGroupInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BootcampGroupInputError';
  }
}

export type BootcampGroupInput = {
  workspaceId: string;
  mode: 'manual' | 'random';
  name: string | null;
  description: string | null;
  profileIds: string[];
  groupCount: number | null;
  prefix: string | null;
};

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BootcampGroupInputError('Data grup tidak valid.');
  }
  return value as Record<string, unknown>;
}

function uuid(value: unknown, label: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new BootcampGroupInputError(`${label} tidak valid.`);
  }
  return value;
}

function optionalText(value: unknown, label: string, maxLength: number): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new BootcampGroupInputError(`${label} tidak valid.`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new BootcampGroupInputError(`${label} terlalu panjang.`);
  return normalized || null;
}

function parseProfileIds(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > 200) {
    throw new BootcampGroupInputError('Daftar siswa grup tidak valid.');
  }
  const result: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    const profileId = uuid(item, 'Profil siswa');
    if (!seen.has(profileId)) {
      seen.add(profileId);
      result.push(profileId);
    }
  }
  return result;
}

function parseGroupCount(value: unknown): number {
  const numberValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(numberValue) || numberValue < 1 || numberValue > 100) {
    throw new BootcampGroupInputError('Jumlah grup harus berupa angka bulat 1–100.');
  }
  return numberValue;
}

export function parseBootcampGroupInput(value: unknown): BootcampGroupInput {
  const input = record(value);
  const workspaceId = uuid(input.workspaceId, 'Batch');
  const mode = input.mode === undefined ? 'manual' : input.mode;
  if (mode !== 'manual' && mode !== 'random') {
    throw new BootcampGroupInputError('Mode pembagian grup tidak valid.');
  }

  const profileIds = parseProfileIds(input.profileIds);
  if (mode === 'random') {
    const groupCount = parseGroupCount(input.groupCount);
    const prefix = optionalText(input.prefix, 'Nama awalan grup', 80) ?? 'Grup';
    return {
      workspaceId,
      mode,
      name: null,
      description: optionalText(input.description, 'Deskripsi grup', 2_000),
      profileIds,
      groupCount,
      prefix,
    };
  }

  const name = optionalText(input.name, 'Nama grup', 180);
  if (!name) throw new BootcampGroupInputError('Nama grup wajib diisi.');
  return {
    workspaceId,
    mode,
    name,
    description: optionalText(input.description, 'Deskripsi grup', 2_000),
    profileIds,
    groupCount: null,
    prefix: null,
  };
}

export function parseBootcampGroupId(value: unknown): string {
  return uuid(value, 'Grup');
}
