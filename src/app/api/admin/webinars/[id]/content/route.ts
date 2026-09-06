import { NextResponse } from 'next/server';
import { assertCurrentAdmin } from '@/lib/auth/context';
import {
  createLesson,
  createResource,
  createSection,
  deleteLesson,
  deleteResource,
  deleteSection,
  reorderLessons,
  reorderResources,
  reorderSections,
  updateLesson,
  updateResource,
  updateSection,
} from '@/lib/webinars/repository';
import { assertUuid, InputError } from '@/lib/webinars/validation';
import { apiError } from '../../_response';

type Context = { params: Promise<{ id: string }> };
type Entity = 'section' | 'lesson' | 'resource';
type Action = 'create' | 'update' | 'delete' | 'reorder';

function requestShape(value: unknown): { entity: Entity; action: Action; id?: string; input?: unknown; ids?: unknown } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new InputError('Data konten tidak valid.');
  const payload = value as Record<string, unknown>;
  if (payload.entity !== 'section' && payload.entity !== 'lesson' && payload.entity !== 'resource') throw new InputError('Jenis konten tidak valid.');
  if (payload.action !== 'create' && payload.action !== 'update' && payload.action !== 'delete' && payload.action !== 'reorder') throw new InputError('Aksi konten tidak valid.');
  return { entity: payload.entity, action: payload.action, id: typeof payload.id === 'string' ? payload.id : undefined, input: payload.input, ids: payload.ids };
}

export async function POST(request: Request, { params }: Context) {
  try {
    const viewer = await assertCurrentAdmin();
    const { id: webinarId } = await params;
    const payload = requestShape(await request.json());
    if (payload.action === 'create') {
      if (payload.entity === 'section') return NextResponse.json({ item: await createSection(webinarId, viewer.id, payload.input) }, { status: 201 });
      if (payload.entity === 'lesson') return NextResponse.json({ item: await createLesson(webinarId, viewer.id, payload.input) }, { status: 201 });
      return NextResponse.json({ item: await createResource(webinarId, viewer.id, payload.input) }, { status: 201 });
    }
    if (payload.action === 'update') {
      const itemId = assertUuid(payload.id, 'Konten');
      if (payload.entity === 'section') return NextResponse.json({ item: await updateSection(webinarId, itemId, viewer.id, payload.input) });
      if (payload.entity === 'lesson') return NextResponse.json({ item: await updateLesson(webinarId, itemId, viewer.id, payload.input) });
      return NextResponse.json({ item: await updateResource(webinarId, itemId, viewer.id, payload.input) });
    }
    if (payload.action === 'delete') {
      const itemId = assertUuid(payload.id, 'Konten');
      if (payload.entity === 'section') await deleteSection(webinarId, itemId, viewer.id);
      else if (payload.entity === 'lesson') await deleteLesson(webinarId, itemId, viewer.id);
      else await deleteResource(webinarId, itemId, viewer.id);
      return NextResponse.json({ ok: true });
    }
    if (payload.entity === 'section') await reorderSections(webinarId, viewer.id, payload.ids);
    else if (payload.entity === 'lesson') await reorderLessons(webinarId, viewer.id, payload.ids);
    else await reorderResources(webinarId, viewer.id, payload.ids);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
