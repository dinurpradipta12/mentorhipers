const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BootcampAnnouncementInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BootcampAnnouncementInputError';
  }
}

export type BootcampAnnouncementInput = {
  workspaceId: string;
  title: string;
  summary: string | null;
  content: string | null;
  category: string | null;
  imageUrl: string | null;
  galleryImages: string[];
  isPinned: boolean;
};

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BootcampAnnouncementInputError('Data pengumuman tidak valid.');
  }
  return value as Record<string, unknown>;
}

function uuid(value: unknown, label: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new BootcampAnnouncementInputError(`${label} tidak valid.`);
  }
  return value;
}

function text(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== 'string') throw new BootcampAnnouncementInputError(`${label} wajib diisi.`);
  const normalized = value.trim();
  if (!normalized) throw new BootcampAnnouncementInputError(`${label} wajib diisi.`);
  if (normalized.length > maxLength) throw new BootcampAnnouncementInputError(`${label} terlalu panjang.`);
  return normalized;
}

function optionalText(value: unknown, label: string, maxLength: number): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new BootcampAnnouncementInputError(`${label} tidak valid.`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new BootcampAnnouncementInputError(`${label} terlalu panjang.`);
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
    throw new BootcampAnnouncementInputError(`${label} harus berupa URL HTTPS yang valid.`);
  }
}

function parseGalleryImages(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > 20) {
    throw new BootcampAnnouncementInputError('Galeri gambar tidak valid.');
  }
  return value.map((item) => {
    const url = optionalHttpsUrl(item, 'URL galeri');
    if (!url) throw new BootcampAnnouncementInputError('URL galeri wajib diisi.');
    return url;
  });
}

export function parseBootcampAnnouncementInput(value: unknown): BootcampAnnouncementInput {
  const input = record(value);
  if (input.isPinned !== undefined && typeof input.isPinned !== 'boolean') {
    throw new BootcampAnnouncementInputError('Status pin pengumuman tidak valid.');
  }
  return {
    workspaceId: uuid(input.workspaceId, 'Batch'),
    title: text(input.title, 'Judul pengumuman', 180),
    summary: optionalText(input.summary, 'Ringkasan pengumuman', 2_000),
    content: optionalText(input.content, 'Isi pengumuman', 50_000),
    category: optionalText(input.category, 'Kategori pengumuman', 80),
    imageUrl: optionalHttpsUrl(input.imageUrl, 'URL gambar'),
    galleryImages: parseGalleryImages(input.galleryImages),
    isPinned: input.isPinned ?? false,
  };
}

export function parseBootcampAnnouncementId(value: unknown): string {
  return uuid(value, 'Pengumuman');
}
