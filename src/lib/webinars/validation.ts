import type { ResourceType, VideoProvider, WebinarStatus } from './types';

const MAX_TITLE_LENGTH = 180;
const MAX_DESCRIPTION_LENGTH = 12_000;
const MAX_CONTENT_LENGTH = 50_000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STORAGE_PATH_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,500}$/;

export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InputError';
  }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new InputError('Data permintaan tidak valid.');
  }
  return value as Record<string, unknown>;
}

export function requiredText(value: unknown, label: string, maxLength = MAX_TITLE_LENGTH): string {
  if (typeof value !== 'string') throw new InputError(`${label} wajib diisi.`);
  const normalized = value.trim();
  if (!normalized) throw new InputError(`${label} wajib diisi.`);
  if (normalized.length > maxLength) throw new InputError(`${label} terlalu panjang.`);
  return normalized;
}

export function optionalText(value: unknown, label: string, maxLength = MAX_DESCRIPTION_LENGTH): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new InputError(`${label} tidak valid.`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new InputError(`${label} terlalu panjang.`);
  return normalized || null;
}

/** Keep rich lesson content as plain text until a reviewed HTML sanitizer is added. */
export function sanitizeContent(value: unknown): string | null {
  const text = optionalText(value, 'Konten lesson', MAX_CONTENT_LENGTH);
  if (!text) return null;
  return text.replace(/<[^>]*>/g, '').replace(/\u0000/g, '').trim() || null;
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function assertUuid(value: unknown, label: string): string {
  if (typeof value !== 'string' || !isUuid(value)) throw new InputError(`${label} tidak valid.`);
  return value;
}

export function parseStatus(value: unknown): WebinarStatus {
  if (value === 'draft' || value === 'published' || value === 'archived') return value;
  throw new InputError('Status webinar tidak valid.');
}

export function parseVideoProvider(value: unknown): VideoProvider {
  if (value === 'youtube' || value === 'vimeo' || value === 'direct' || value === 'storage') return value;
  throw new InputError('Provider video tidak valid.');
}

export function parseResourceType(value: unknown): ResourceType {
  if (value === 'link' || value === 'file' || value === 'worksheet' || value === 'slide' || value === 'download') return value;
  throw new InputError('Tipe resource tidak valid.');
}

export function parseSortOrder(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0);
  if (!Number.isInteger(numeric) || numeric < 0 || numeric > 100_000) throw new InputError('Urutan tidak valid.');
  return numeric;
}

export function parseDuration(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(numeric) || numeric < 0 || numeric > 86_400) throw new InputError('Durasi video tidak valid.');
  return numeric;
}

function url(value: unknown, label: string, allowedHosts?: Set<string>): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new InputError(`${label} tidak valid.`);
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new InputError(`${label} harus berupa URL yang valid.`);
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new InputError(`${label} harus menggunakan HTTPS yang aman.`);
  }
  if (allowedHosts && !allowedHosts.has(parsed.hostname.toLowerCase())) {
    throw new InputError(`${label} bukan domain provider yang diizinkan.`);
  }
  return parsed.toString();
}

export function parseCoverUrl(value: unknown) {
  return url(value, 'Cover URL');
}

export function parseVideoUrl(provider: VideoProvider, value: unknown): string | null {
  if (provider === 'storage') return null;
  const youtube = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be']);
  const vimeo = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);
  return provider === 'youtube'
    ? url(value, 'URL YouTube', youtube)
    : provider === 'vimeo'
      ? url(value, 'URL Vimeo', vimeo)
      : url(value, 'URL video');
}

export function parsePublicUrl(value: unknown): string | null {
  return url(value, 'URL resource');
}

export function parseStoragePath(value: unknown, label: string): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !STORAGE_PATH_PATTERN.test(value) || value.includes('..')) {
    throw new InputError(`${label} tidak valid.`);
  }
  return value;
}

export function slugify(value: string): string {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
  return slug || 'lesson';
}

export type WebinarInput = {
  title: string;
  description: string;
  instructorName: string | null;
  category: string | null;
  coverUrl: string | null;
  coverStoragePath: string | null;
};

export function parseWebinarInput(value: unknown): WebinarInput {
  const input = record(value);
  const coverUrl = parseCoverUrl(input.coverUrl);
  const coverStoragePath = parseStoragePath(input.coverStoragePath, 'Path cover');
  if (coverUrl && coverStoragePath) throw new InputError('Pilih URL cover atau file cover, bukan keduanya.');
  return {
    title: requiredText(input.title, 'Judul webinar'),
    description: optionalText(input.description, 'Deskripsi webinar', MAX_DESCRIPTION_LENGTH) ?? '',
    instructorName: optionalText(input.instructorName, 'Nama instruktur'),
    category: optionalText(input.category, 'Kategori', 80),
    coverUrl,
    coverStoragePath,
  };
}

export type SectionInput = { title: string; description: string | null; sortOrder: number };

export function parseSectionInput(value: unknown): SectionInput {
  const input = record(value);
  return {
    title: requiredText(input.title, 'Judul section'),
    description: optionalText(input.description, 'Deskripsi section'),
    sortOrder: parseSortOrder(input.sortOrder),
  };
}

export type LessonInput = {
  sectionId: string;
  title: string;
  lessonSlug: string;
  description: string | null;
  videoProvider: VideoProvider;
  videoUrl: string | null;
  storagePath: string | null;
  thumbnailUrl: string | null;
  thumbnailStoragePath: string | null;
  durationSeconds: number | null;
  contentRich: string | null;
  sortOrder: number;
  isPublished: boolean;
};

export function parseLessonInput(value: unknown): LessonInput {
  const input = record(value);
  const title = requiredText(input.title, 'Judul lesson');
  const videoProvider = parseVideoProvider(input.videoProvider);
  const videoUrl = parseVideoUrl(videoProvider, input.videoUrl);
  const storagePath = parseStoragePath(input.storagePath, 'Path video');
  if (videoProvider === 'storage' ? !storagePath || videoUrl : !videoUrl || storagePath) {
    throw new InputError('Sumber video tidak sesuai dengan provider yang dipilih.');
  }
  const thumbnailUrl = parseCoverUrl(input.thumbnailUrl);
  const thumbnailStoragePath = parseStoragePath(input.thumbnailStoragePath, 'Path thumbnail');
  if (thumbnailUrl && thumbnailStoragePath) throw new InputError('Pilih URL thumbnail atau file thumbnail, bukan keduanya.');
  const rawSlug = optionalText(input.lessonSlug, 'Slug lesson', 100);
  return {
    sectionId: assertUuid(input.sectionId, 'Section'),
    title,
    lessonSlug: slugify(rawSlug ?? title),
    description: optionalText(input.description, 'Deskripsi lesson'),
    videoProvider,
    videoUrl,
    storagePath,
    thumbnailUrl,
    thumbnailStoragePath,
    durationSeconds: parseDuration(input.durationSeconds),
    contentRich: sanitizeContent(input.contentRich),
    sortOrder: parseSortOrder(input.sortOrder),
    isPublished: input.isPublished === true,
  };
}

export type ResourceInput = {
  lessonId: string;
  title: string;
  resourceType: ResourceType;
  publicUrl: string | null;
  storagePath: string | null;
  sortOrder: number;
};

export function parseResourceInput(value: unknown): ResourceInput {
  const input = record(value);
  const publicUrl = parsePublicUrl(input.publicUrl);
  const storagePath = parseStoragePath(input.storagePath, 'Path resource');
  if ((publicUrl && storagePath) || (!publicUrl && !storagePath)) throw new InputError('Resource harus memiliki satu sumber file atau URL.');
  return {
    lessonId: assertUuid(input.lessonId, 'Lesson'),
    title: requiredText(input.title, 'Judul resource'),
    resourceType: parseResourceType(input.resourceType),
    publicUrl,
    storagePath,
    sortOrder: parseSortOrder(input.sortOrder),
  };
}
