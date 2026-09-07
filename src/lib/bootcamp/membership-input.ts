const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BootcampMembershipInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BootcampMembershipInputError';
  }
}

export type BootcampMembershipPatchInput = {
  workspaceId: string;
  role?: 'member' | 'student' | 'removed';
  groupName?: string | null;
  groupWaLink?: string | null;
  isLeader?: boolean;
  credentialNo?: string | null;
  certificateUrl?: string | null;
  attendance?: Record<string, string> | null;
  plusPoints?: Record<string, number> | null;
};

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BootcampMembershipInputError('Data membership tidak valid.');
  }
  return value as Record<string, unknown>;
}

function uuid(value: unknown, label: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new BootcampMembershipInputError(`${label} tidak valid.`);
  }
  return value;
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function optionalText(value: unknown, label: string, maxLength: number): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new BootcampMembershipInputError(`${label} tidak valid.`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new BootcampMembershipInputError(`${label} terlalu panjang.`);
  return normalized || null;
}

function optionalHttpsUrl(value: unknown, label: string): string | null {
  const candidate = optionalText(value, label, 2_000);
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('unsafe');
    return parsed.toString();
  } catch {
    throw new BootcampMembershipInputError(`${label} harus berupa URL HTTPS yang valid.`);
  }
}

function parseAttendance(value: unknown): Record<string, string> | null {
  if (value === null || value === undefined) return null;
  const input = record(value);
  const entries = Object.entries(input);
  if (entries.length > 366) throw new BootcampMembershipInputError('Absensi tidak boleh memiliki lebih dari 366 catatan.');
  const result: Record<string, string> = {};
  for (const [key, rawStatus] of entries) {
    if (!key.trim() || key.length > 120 || typeof rawStatus !== 'string' || rawStatus.trim().length > 40) {
      throw new BootcampMembershipInputError('Format absensi tidak valid.');
    }
    result[key] = rawStatus.trim();
  }
  return result;
}

function parsePlusPoints(value: unknown): Record<string, number> | null {
  if (value === null || value === undefined) return null;
  const input = record(value);
  const entries = Object.entries(input);
  if (entries.length > 100) throw new BootcampMembershipInputError('Plus points tidak boleh memiliki lebih dari 100 catatan.');
  const result: Record<string, number> = {};
  for (const [key, rawPoints] of entries) {
    const points = typeof rawPoints === 'number' ? rawPoints : Number(rawPoints);
    if (!key.trim() || key.length > 120 || !Number.isFinite(points) || points < -10_000 || points > 10_000) {
      throw new BootcampMembershipInputError('Format plus points tidak valid.');
    }
    result[key] = Math.round(points);
  }
  return result;
}

export function parseBootcampMembershipPatch(value: unknown): BootcampMembershipPatchInput {
  const input = record(value);
  const parsed: BootcampMembershipPatchInput = {
    workspaceId: uuid(input.workspaceId, 'Batch'),
  };
  if (hasOwn(input, 'role')) {
    if (input.role !== 'member' && input.role !== 'student' && input.role !== 'removed') {
      throw new BootcampMembershipInputError('Status akses siswa tidak valid.');
    }
    parsed.role = input.role;
  }
  if (hasOwn(input, 'groupName')) parsed.groupName = optionalText(input.groupName, 'Nama grup', 180);
  if (hasOwn(input, 'groupWaLink')) parsed.groupWaLink = optionalHttpsUrl(input.groupWaLink, 'Link WhatsApp grup');
  if (hasOwn(input, 'isLeader')) {
    if (typeof input.isLeader !== 'boolean') throw new BootcampMembershipInputError('Status ketua grup tidak valid.');
    parsed.isLeader = input.isLeader;
  }
  if (hasOwn(input, 'credentialNo')) parsed.credentialNo = optionalText(input.credentialNo, 'Credential number', 120);
  if (hasOwn(input, 'certificateUrl')) parsed.certificateUrl = optionalHttpsUrl(input.certificateUrl, 'Link sertifikat');
  if (hasOwn(input, 'attendance')) parsed.attendance = parseAttendance(input.attendance);
  if (hasOwn(input, 'plusPoints')) parsed.plusPoints = parsePlusPoints(input.plusPoints);
  if (Object.keys(parsed).length === 1) throw new BootcampMembershipInputError('Pilih setidaknya satu perubahan membership.');
  return parsed;
}

export function parseBootcampProfileName(value: unknown): { fullName: string } {
  const input = record(value);
  const rawName = input.fullName;
  if (typeof rawName !== 'string' || !rawName.trim()) throw new BootcampMembershipInputError('Nama siswa wajib diisi.');
  const fullName = rawName.trim();
  if (fullName.length > 180) throw new BootcampMembershipInputError('Nama siswa terlalu panjang.');
  return { fullName };
}
