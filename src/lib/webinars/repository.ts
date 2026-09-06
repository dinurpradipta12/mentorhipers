import 'server-only';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  InputError,
  assertUuid,
  parseLessonInput,
  parseResourceInput,
  parseSectionInput,
  parseWebinarInput,
} from './validation';
import type {
  PublicWebinar,
  PublicWebinarLesson,
  WebinarEditorData,
  WebinarLesson,
  WebinarListItem,
  WebinarResource,
  WebinarSection,
  WebinarStatus,
} from './types';

export class WebinarNotFoundError extends Error {
  constructor() {
    super('WEBINAR_NOT_FOUND');
  }
}

export class WebinarSchemaUnavailableError extends Error {
  constructor() {
    super('WEBINAR_SCHEMA_UNAVAILABLE');
  }
}

function schemaUnavailable(error: { code?: string; message?: string } | null): boolean {
  return error?.code === '42P01' || error?.code === 'PGRST205' || /public_webinars/i.test(error?.message ?? '');
}

function fail(error: { code?: string; message?: string } | null, fallback: string): never {
  if (schemaUnavailable(error)) throw new WebinarSchemaUnavailableError();
  throw new Error(fallback);
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asNumber(value: unknown): number {
  const number = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 't';
}

function mapWebinar(row: Record<string, unknown>, lessonCount = 0): WebinarListItem {
  return {
    id: String(row.id),
    publicCode: String(row.public_code),
    title: String(row.title),
    description: String(row.description ?? ''),
    instructorName: asString(row.instructor_name),
    category: asString(row.category),
    coverUrl: asString(row.cover_url),
    coverStoragePath: asString(row.cover_storage_path),
    status: row.status as WebinarStatus,
    publishedAt: asString(row.published_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    lessonCount,
  };
}

function mapSection(row: Record<string, unknown>): WebinarSection {
  return {
    id: String(row.id),
    webinarId: String(row.webinar_id),
    title: String(row.title),
    description: asString(row.description),
    sortOrder: asNumber(row.sort_order),
  };
}

function mapLesson(row: Record<string, unknown>): WebinarLesson {
  return {
    id: String(row.id),
    webinarId: String(row.webinar_id),
    sectionId: String(row.section_id),
    title: String(row.title),
    lessonSlug: String(row.lesson_slug),
    description: asString(row.description),
    videoProvider: row.video_provider as WebinarLesson['videoProvider'],
    videoUrl: asString(row.video_url),
    storagePath: asString(row.storage_path),
    thumbnailUrl: asString(row.thumbnail_url),
    thumbnailStoragePath: asString(row.thumbnail_storage_path),
    durationSeconds: row.duration_seconds === null || row.duration_seconds === undefined ? null : asNumber(row.duration_seconds),
    contentRich: asString(row.content_rich),
    sortOrder: asNumber(row.sort_order),
    isPublished: asBoolean(row.is_published),
  };
}

function mapResource(row: Record<string, unknown>): WebinarResource {
  return {
    id: String(row.id),
    webinarId: String(row.webinar_id),
    lessonId: String(row.lesson_id),
    title: String(row.title),
    resourceType: row.resource_type as WebinarResource['resourceType'],
    publicUrl: asString(row.public_url),
    storagePath: asString(row.storage_path),
    sortOrder: asNumber(row.sort_order),
  };
}

function randomHex(bytes: number): string {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => value.toString(16).padStart(2, '0')).join('');
}

function generatedPublicCode(): string {
  const values = new Uint8Array(6);
  crypto.getRandomValues(values);
  return btoa(String.fromCharCode(...values)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '').slice(0, 8);
}

async function writeAuditLog(webinarId: string, actorId: string, action: string, beforeState?: unknown, afterState?: unknown) {
  const { error } = await getSupabaseAdminClient()
    .from('webinar_audit_logs')
    .insert({
      webinar_id: webinarId,
      actor_id: actorId,
      action,
      before_state: beforeState ?? null,
      after_state: afterState ?? null,
    });

  // Auditing should never hide a successful operation. A server log can record
  // this after the schema migration is available.
  if (error && !schemaUnavailable(error)) console.error('Webinar audit log failed.');
}

export async function listAdminWebinars(): Promise<WebinarListItem[]> {
  const admin = getSupabaseAdminClient();
  const { data: webinarRows, error: webinarError } = await admin
    .from('public_webinars')
    .select('id, public_code, title, description, instructor_name, category, cover_url, cover_storage_path, status, published_at, created_at, updated_at')
    .order('updated_at', { ascending: false });
  if (webinarError) {
    if (schemaUnavailable(webinarError)) return [];
    fail(webinarError, 'Unable to load webinars.');
  }

  const webinars = (webinarRows ?? []) as Array<Record<string, unknown>>;
  if (webinars.length === 0) return [];
  const { data: lessonRows, error: lessonError } = await admin
    .from('webinar_lessons')
    .select('webinar_id')
    .in('webinar_id', webinars.map((webinar) => String(webinar.id)));
  if (lessonError) fail(lessonError, 'Unable to count webinar lessons.');
  const counts = new Map<string, number>();
  for (const lesson of (lessonRows ?? []) as Array<Record<string, unknown>>) {
    const id = String(lesson.webinar_id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return Promise.all(webinars.map(async (webinar) => {
    const mapped = mapWebinar(webinar, counts.get(String(webinar.id)) ?? 0);
    return {
      ...mapped,
      // The bucket is private. Admin cards receive only a short-lived signed
      // URL, never a Storage object path rendered as a public URL.
      coverUrl: mapped.coverStoragePath ? await signedUrl(mapped.coverStoragePath) : mapped.coverUrl,
    };
  }));
}

export async function getAdminWebinar(id: string): Promise<WebinarEditorData> {
  assertUuid(id, 'Webinar');
  const admin = getSupabaseAdminClient();
  const { data: webinarRow, error: webinarError } = await admin
    .from('public_webinars')
    .select('id, public_code, title, description, instructor_name, category, cover_url, cover_storage_path, status, published_at, created_at, updated_at')
    .eq('id', id)
    .maybeSingle();
  if (webinarError) fail(webinarError, 'Unable to load webinar.');
  if (!webinarRow) throw new WebinarNotFoundError();

  const [sectionResult, lessonResult, resourceResult] = await Promise.all([
    admin.from('webinar_sections').select('id, webinar_id, title, description, sort_order').eq('webinar_id', id).order('sort_order', { ascending: true }),
    admin.from('webinar_lessons').select('id, webinar_id, section_id, title, lesson_slug, description, video_provider, video_url, storage_path, thumbnail_url, thumbnail_storage_path, duration_seconds, content_rich, sort_order, is_published').eq('webinar_id', id).order('sort_order', { ascending: true }),
    admin.from('webinar_resources').select('id, webinar_id, lesson_id, title, resource_type, public_url, storage_path, sort_order').eq('webinar_id', id).order('sort_order', { ascending: true }),
  ]);
  if (sectionResult.error) fail(sectionResult.error, 'Unable to load webinar sections.');
  if (lessonResult.error) fail(lessonResult.error, 'Unable to load webinar lessons.');
  if (resourceResult.error) fail(resourceResult.error, 'Unable to load webinar resources.');

  const lessons = ((lessonResult.data ?? []) as Array<Record<string, unknown>>).map(mapLesson);
  return {
    ...mapWebinar(webinarRow as Record<string, unknown>, lessons.length),
    sections: ((sectionResult.data ?? []) as Array<Record<string, unknown>>).map(mapSection),
    lessons,
    resources: ((resourceResult.data ?? []) as Array<Record<string, unknown>>).map(mapResource),
  };
}

export async function createWebinar(actorId: string, input: unknown): Promise<WebinarEditorData> {
  const parsed = parseWebinarInput(input);
  const admin = getSupabaseAdminClient();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const publicCode = generatedPublicCode();
    const { data, error } = await admin
      .from('public_webinars')
      .insert({
        public_code: publicCode,
        title: parsed.title,
        description: parsed.description,
        instructor_name: parsed.instructorName,
        category: parsed.category,
        cover_url: parsed.coverUrl,
        cover_storage_path: parsed.coverStoragePath,
        status: 'draft',
        created_by: actorId,
      })
      .select('id')
      .single();

    if (!error && data?.id) {
      await writeAuditLog(String(data.id), actorId, 'webinar.created', undefined, { public_code: publicCode, status: 'draft' });
      return getAdminWebinar(String(data.id));
    }
    if (error?.code !== '23505') fail(error, 'Unable to create webinar.');
  }

  throw new Error('Unable to generate a unique public code.');
}

export async function updateWebinar(id: string, actorId: string, input: unknown): Promise<WebinarEditorData> {
  assertUuid(id, 'Webinar');
  const before = await getAdminWebinar(id);
  const parsed = parseWebinarInput(input);
  const { error } = await getSupabaseAdminClient()
    .from('public_webinars')
    .update({
      title: parsed.title,
      description: parsed.description,
      instructor_name: parsed.instructorName,
      category: parsed.category,
      cover_url: parsed.coverUrl,
      cover_storage_path: parsed.coverStoragePath,
    })
    .eq('id', id);
  if (error) fail(error, 'Unable to update webinar.');
  await writeAuditLog(id, actorId, 'webinar.updated', before, parsed);
  return getAdminWebinar(id);
}

export async function setWebinarStatus(id: string, actorId: string, status: WebinarStatus): Promise<WebinarEditorData> {
  assertUuid(id, 'Webinar');
  const before = await getAdminWebinar(id);
  if (status === 'published') {
    const { count, error: lessonError } = await getSupabaseAdminClient()
      .from('webinar_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('webinar_id', id)
      .eq('is_published', true);
    if (lessonError) fail(lessonError, 'Unable to verify webinar lessons.');
    if (!count) throw new InputError('Publikasikan setidaknya satu lesson sebelum menerbitkan webinar.');
  }

  const patch = status === 'published'
    ? { status, published_at: new Date().toISOString() }
    : { status, published_at: null };
  const { error } = await getSupabaseAdminClient().from('public_webinars').update(patch).eq('id', id);
  if (error) fail(error, 'Unable to update webinar status.');
  await writeAuditLog(id, actorId, `webinar.status_${status}`, { status: before.status }, patch);
  return getAdminWebinar(id);
}

export async function archiveWebinar(id: string, actorId: string): Promise<WebinarEditorData> {
  return setWebinarStatus(id, actorId, 'archived');
}

export async function createSection(webinarId: string, actorId: string, input: unknown): Promise<WebinarSection> {
  assertUuid(webinarId, 'Webinar');
  const parsed = parseSectionInput(input);
  const { data, error } = await getSupabaseAdminClient()
    .from('webinar_sections')
    .insert({ webinar_id: webinarId, title: parsed.title, description: parsed.description, sort_order: parsed.sortOrder })
    .select('id, webinar_id, title, description, sort_order')
    .single();
  if (error) fail(error, 'Unable to create webinar section.');
  const section = mapSection(data as Record<string, unknown>);
  await writeAuditLog(webinarId, actorId, 'section.created', undefined, section);
  return section;
}

export async function updateSection(webinarId: string, sectionId: string, actorId: string, input: unknown): Promise<WebinarSection> {
  assertUuid(webinarId, 'Webinar');
  assertUuid(sectionId, 'Section');
  const parsed = parseSectionInput(input);
  const { data, error } = await getSupabaseAdminClient()
    .from('webinar_sections')
    .update({ title: parsed.title, description: parsed.description, sort_order: parsed.sortOrder })
    .eq('id', sectionId)
    .eq('webinar_id', webinarId)
    .select('id, webinar_id, title, description, sort_order')
    .maybeSingle();
  if (error) fail(error, 'Unable to update webinar section.');
  if (!data) throw new WebinarNotFoundError();
  const section = mapSection(data as Record<string, unknown>);
  await writeAuditLog(webinarId, actorId, 'section.updated', undefined, section);
  return section;
}

export async function deleteSection(webinarId: string, sectionId: string, actorId: string): Promise<void> {
  assertUuid(webinarId, 'Webinar');
  assertUuid(sectionId, 'Section');
  const { data, error } = await getSupabaseAdminClient()
    .from('webinar_sections')
    .delete()
    .eq('id', sectionId)
    .eq('webinar_id', webinarId)
    .select('id')
    .maybeSingle();
  if (error) fail(error, 'Unable to delete webinar section.');
  if (!data) throw new WebinarNotFoundError();
  await writeAuditLog(webinarId, actorId, 'section.deleted', { section_id: sectionId });
}

export async function createLesson(webinarId: string, actorId: string, input: unknown): Promise<WebinarLesson> {
  assertUuid(webinarId, 'Webinar');
  const parsed = parseLessonInput(input);
  const { data, error } = await getSupabaseAdminClient()
    .from('webinar_lessons')
    .insert({
      webinar_id: webinarId,
      section_id: parsed.sectionId,
      title: parsed.title,
      lesson_slug: parsed.lessonSlug,
      description: parsed.description,
      video_provider: parsed.videoProvider,
      video_url: parsed.videoUrl,
      storage_path: parsed.storagePath,
      thumbnail_url: parsed.thumbnailUrl,
      thumbnail_storage_path: parsed.thumbnailStoragePath,
      duration_seconds: parsed.durationSeconds,
      content_rich: parsed.contentRich,
      sort_order: parsed.sortOrder,
      is_published: parsed.isPublished,
    })
    .select('id, webinar_id, section_id, title, lesson_slug, description, video_provider, video_url, storage_path, thumbnail_url, thumbnail_storage_path, duration_seconds, content_rich, sort_order, is_published')
    .single();
  if (error) fail(error, 'Unable to create webinar lesson.');
  const lesson = mapLesson(data as Record<string, unknown>);
  await writeAuditLog(webinarId, actorId, 'lesson.created', undefined, lesson);
  return lesson;
}

export async function updateLesson(webinarId: string, lessonId: string, actorId: string, input: unknown): Promise<WebinarLesson> {
  assertUuid(webinarId, 'Webinar');
  assertUuid(lessonId, 'Lesson');
  const parsed = parseLessonInput(input);
  const { data, error } = await getSupabaseAdminClient()
    .from('webinar_lessons')
    .update({
      section_id: parsed.sectionId,
      title: parsed.title,
      lesson_slug: parsed.lessonSlug,
      description: parsed.description,
      video_provider: parsed.videoProvider,
      video_url: parsed.videoUrl,
      storage_path: parsed.storagePath,
      thumbnail_url: parsed.thumbnailUrl,
      thumbnail_storage_path: parsed.thumbnailStoragePath,
      duration_seconds: parsed.durationSeconds,
      content_rich: parsed.contentRich,
      sort_order: parsed.sortOrder,
      is_published: parsed.isPublished,
    })
    .eq('id', lessonId)
    .eq('webinar_id', webinarId)
    .select('id, webinar_id, section_id, title, lesson_slug, description, video_provider, video_url, storage_path, thumbnail_url, thumbnail_storage_path, duration_seconds, content_rich, sort_order, is_published')
    .maybeSingle();
  if (error) fail(error, 'Unable to update webinar lesson.');
  if (!data) throw new WebinarNotFoundError();
  const lesson = mapLesson(data as Record<string, unknown>);
  await writeAuditLog(webinarId, actorId, 'lesson.updated', undefined, lesson);
  return lesson;
}

export async function deleteLesson(webinarId: string, lessonId: string, actorId: string): Promise<void> {
  assertUuid(webinarId, 'Webinar');
  assertUuid(lessonId, 'Lesson');
  const { data, error } = await getSupabaseAdminClient()
    .from('webinar_lessons')
    .delete()
    .eq('id', lessonId)
    .eq('webinar_id', webinarId)
    .select('id')
    .maybeSingle();
  if (error) fail(error, 'Unable to delete webinar lesson.');
  if (!data) throw new WebinarNotFoundError();
  await writeAuditLog(webinarId, actorId, 'lesson.deleted', { lesson_id: lessonId });
}

export async function createResource(webinarId: string, actorId: string, input: unknown): Promise<WebinarResource> {
  assertUuid(webinarId, 'Webinar');
  const parsed = parseResourceInput(input);
  const { data, error } = await getSupabaseAdminClient()
    .from('webinar_resources')
    .insert({
      webinar_id: webinarId,
      lesson_id: parsed.lessonId,
      title: parsed.title,
      resource_type: parsed.resourceType,
      public_url: parsed.publicUrl,
      storage_path: parsed.storagePath,
      sort_order: parsed.sortOrder,
    })
    .select('id, webinar_id, lesson_id, title, resource_type, public_url, storage_path, sort_order')
    .single();
  if (error) fail(error, 'Unable to create webinar resource.');
  const resource = mapResource(data as Record<string, unknown>);
  await writeAuditLog(webinarId, actorId, 'resource.created', undefined, resource);
  return resource;
}

export async function updateResource(webinarId: string, resourceId: string, actorId: string, input: unknown): Promise<WebinarResource> {
  assertUuid(webinarId, 'Webinar');
  assertUuid(resourceId, 'Resource');
  const parsed = parseResourceInput(input);
  const { data, error } = await getSupabaseAdminClient()
    .from('webinar_resources')
    .update({
      lesson_id: parsed.lessonId,
      title: parsed.title,
      resource_type: parsed.resourceType,
      public_url: parsed.publicUrl,
      storage_path: parsed.storagePath,
      sort_order: parsed.sortOrder,
    })
    .eq('id', resourceId)
    .eq('webinar_id', webinarId)
    .select('id, webinar_id, lesson_id, title, resource_type, public_url, storage_path, sort_order')
    .maybeSingle();
  if (error) fail(error, 'Unable to update webinar resource.');
  if (!data) throw new WebinarNotFoundError();
  const resource = mapResource(data as Record<string, unknown>);
  await writeAuditLog(webinarId, actorId, 'resource.updated', undefined, resource);
  return resource;
}

export async function deleteResource(webinarId: string, resourceId: string, actorId: string): Promise<void> {
  assertUuid(webinarId, 'Webinar');
  assertUuid(resourceId, 'Resource');
  const { data, error } = await getSupabaseAdminClient()
    .from('webinar_resources')
    .delete()
    .eq('id', resourceId)
    .eq('webinar_id', webinarId)
    .select('id')
    .maybeSingle();
  if (error) fail(error, 'Unable to delete webinar resource.');
  if (!data) throw new WebinarNotFoundError();
  await writeAuditLog(webinarId, actorId, 'resource.deleted', { resource_id: resourceId });
}

async function reorder(webinarId: string, actorId: string, entity: 'section' | 'lesson' | 'resource', ids: unknown) {
  assertUuid(webinarId, 'Webinar');
  if (!Array.isArray(ids) || ids.length === 0 || ids.some((id) => typeof id !== 'string' || !assertUuid(id, 'Item'))) {
    throw new InputError('Urutan item tidak valid.');
  }
  if (new Set(ids).size !== ids.length) throw new InputError('Urutan item memiliki duplikasi.');

  const table = entity === 'section' ? 'webinar_sections' : entity === 'lesson' ? 'webinar_lessons' : 'webinar_resources';
  const { data: existingRows, error: existingError } = await getSupabaseAdminClient()
    .from(table)
    .select('id')
    .eq('webinar_id', webinarId)
    .in('id', ids as string[]);
  if (existingError) fail(existingError, 'Unable to verify order.');
  if ((existingRows ?? []).length !== ids.length) throw new WebinarNotFoundError();

  await Promise.all((ids as string[]).map(async (id, index) => {
    const { error } = await getSupabaseAdminClient().from(table).update({ sort_order: index }).eq('id', id).eq('webinar_id', webinarId);
    if (error) fail(error, 'Unable to reorder webinar content.');
  }));
  await writeAuditLog(webinarId, actorId, `${entity}.reordered`, undefined, { ids });
}

export async function reorderSections(webinarId: string, actorId: string, ids: unknown) {
  return reorder(webinarId, actorId, 'section', ids);
}

export async function reorderLessons(webinarId: string, actorId: string, ids: unknown) {
  return reorder(webinarId, actorId, 'lesson', ids);
}

export async function reorderResources(webinarId: string, actorId: string, ids: unknown) {
  return reorder(webinarId, actorId, 'resource', ids);
}

async function signedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await getSupabaseAdminClient().storage.from('webinar-media').createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/**
 * Convert editor rows into the intentionally small, public visitor model.
 * Keep this allowlist explicit: neither UUIDs nor private Storage paths should
 * cross the public server-component boundary.
 */
async function materializePublicWebinar(
  webinar: Pick<WebinarListItem, 'publicCode' | 'title' | 'description' | 'instructorName' | 'category' | 'coverUrl' | 'coverStoragePath' | 'publishedAt' | 'updatedAt'>,
  sections: WebinarSection[],
  lessons: WebinarLesson[],
  resources: WebinarResource[],
  includeUnpublishedLessons = false,
): Promise<PublicWebinar> {
  const visibleLessons = includeUnpublishedLessons ? lessons : lessons.filter((lesson) => lesson.isPublished);
  const lessonSectionIds = new Map(visibleLessons.map((lesson) => [lesson.lessonSlug, lesson.sectionId]));
  const publicLessons = await Promise.all(visibleLessons.map(async (lesson): Promise<PublicWebinarLesson> => ({
    lessonSlug: lesson.lessonSlug,
    title: lesson.title,
    description: lesson.description,
    videoProvider: lesson.videoProvider,
    videoUrl: lesson.videoProvider === 'storage' ? await signedUrl(lesson.storagePath) : lesson.videoUrl,
    thumbnailUrl: lesson.thumbnailStoragePath ? await signedUrl(lesson.thumbnailStoragePath) : lesson.thumbnailUrl,
    durationSeconds: lesson.durationSeconds,
    contentRich: lesson.contentRich,
    sortOrder: lesson.sortOrder,
    resources: await Promise.all(resources.filter((resource) => resource.lessonId === lesson.id).map(async (resource) => ({
      title: resource.title,
      resourceType: resource.resourceType,
      publicUrl: resource.storagePath ? await signedUrl(resource.storagePath) : resource.publicUrl,
      sortOrder: resource.sortOrder,
    }))),
  })));

  return {
    publicCode: webinar.publicCode,
    title: webinar.title,
    description: webinar.description,
    instructorName: webinar.instructorName,
    category: webinar.category,
    coverUrl: webinar.coverStoragePath ? await signedUrl(webinar.coverStoragePath) : webinar.coverUrl,
    publishedAt: webinar.publishedAt ?? webinar.updatedAt,
    sections: sections.map((section) => ({
      title: section.title,
      description: section.description,
      sortOrder: section.sortOrder,
      lessons: publicLessons.filter((lesson) => lessonSectionIds.get(lesson.lessonSlug) === section.id),
    })),
  };
}

export async function getPublicWebinar(publicCode: string): Promise<PublicWebinar | null> {
  if (!/^[A-Za-z0-9_-]{7,12}$/.test(publicCode)) return null;
  const admin = getSupabaseAdminClient();
  const { data: webinarRow, error: webinarError } = await admin
    .from('public_webinars')
    .select('id, public_code, title, description, instructor_name, category, cover_url, cover_storage_path, published_at')
    .eq('public_code', publicCode)
    .eq('status', 'published')
    .maybeSingle();
  if (webinarError) {
    if (schemaUnavailable(webinarError)) return null;
    fail(webinarError, 'Unable to load public webinar.');
  }
  if (!webinarRow) return null;
  const webinar = webinarRow as Record<string, unknown>;
  const webinarId = String(webinar.id);

  const [sectionResult, lessonResult] = await Promise.all([
    admin.from('webinar_sections').select('id, webinar_id, title, description, sort_order').eq('webinar_id', webinarId).order('sort_order', { ascending: true }),
    admin.from('webinar_lessons').select('id, webinar_id, section_id, title, lesson_slug, description, video_provider, video_url, storage_path, thumbnail_url, thumbnail_storage_path, duration_seconds, content_rich, sort_order, is_published').eq('webinar_id', webinarId).eq('is_published', true).order('sort_order', { ascending: true }),
  ]);
  if (sectionResult.error) fail(sectionResult.error, 'Unable to load public webinar sections.');
  if (lessonResult.error) fail(lessonResult.error, 'Unable to load public webinar lessons.');

  const lessons = ((lessonResult.data ?? []) as Array<Record<string, unknown>>).map(mapLesson);
  const { data: resourceRows, error: resourceError } = lessons.length === 0
    ? { data: [], error: null }
    : await admin.from('webinar_resources').select('id, webinar_id, lesson_id, title, resource_type, public_url, storage_path, sort_order').eq('webinar_id', webinarId).in('lesson_id', lessons.map((lesson) => lesson.id)).order('sort_order', { ascending: true });
  if (resourceError) fail(resourceError, 'Unable to load public webinar resources.');
  const resources = ((resourceRows ?? []) as Array<Record<string, unknown>>).map(mapResource);

  return materializePublicWebinar(
    {
      publicCode: String(webinar.public_code),
      title: String(webinar.title),
      description: String(webinar.description ?? ''),
      instructorName: asString(webinar.instructor_name),
      category: asString(webinar.category),
      coverUrl: asString(webinar.cover_url),
      coverStoragePath: asString(webinar.cover_storage_path),
      publishedAt: asString(webinar.published_at),
      updatedAt: asString(webinar.published_at) ?? new Date(0).toISOString(),
    },
    ((sectionResult.data ?? []) as Array<Record<string, unknown>>).map(mapSection),
    lessons,
    resources,
  );
}

/** Administrative-only visitor preview. The route calling this is protected by
 * the server admin layout; a draft never reaches the public `/w/[publicCode]`
 * route. */
export async function getAdminWebinarPreview(id: string): Promise<PublicWebinar> {
  const editor = await getAdminWebinar(id);
  return materializePublicWebinar(editor, editor.sections, editor.lessons, editor.resources, true);
}

const uploadRules = {
  cover: { folder: 'covers', mime: new Set(['image/jpeg', 'image/png', 'image/webp']), maxBytes: 10 * 1024 * 1024 },
  thumbnail: { folder: 'thumbnails', mime: new Set(['image/jpeg', 'image/png', 'image/webp']), maxBytes: 10 * 1024 * 1024 },
  video: { folder: 'videos', mime: new Set(['video/mp4']), maxBytes: 100 * 1024 * 1024 },
  resource: { folder: 'resources', mime: new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']), maxBytes: 25 * 1024 * 1024 },
} as const;

export async function uploadWebinarFile(
  webinarId: string,
  actorId: string,
  kind: keyof typeof uploadRules,
  file: File,
): Promise<{ storagePath: string }> {
  assertUuid(webinarId, 'Webinar');
  const rule = uploadRules[kind];
  if (!rule) throw new InputError('Jenis upload tidak valid.');
  if (!file.size || file.size > rule.maxBytes || !rule.mime.has(file.type)) {
    throw new InputError('Ukuran atau tipe file tidak diizinkan.');
  }
  const extension = file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|pdf|mp4)$/)?.[1] ?? '';
  if (!extension) throw new InputError('Ekstensi file tidak diizinkan.');
  const storagePath = `webinars/${webinarId}/${rule.folder}/${randomHex(12)}.${extension}`;
  const { error } = await getSupabaseAdminClient().storage.from('webinar-media').upload(
    storagePath,
    new Uint8Array(await file.arrayBuffer()),
    { contentType: file.type, upsert: false },
  );
  if (error) fail(error, 'Unable to upload webinar file.');
  await writeAuditLog(webinarId, actorId, `file.uploaded.${kind}`, undefined, { storage_path: storagePath });
  return { storagePath };
}
