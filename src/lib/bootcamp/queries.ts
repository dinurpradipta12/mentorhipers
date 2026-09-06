import 'server-only';

import type { Viewer } from '@/lib/auth/context';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export type BootcampBatch = {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  max_members: string | null;
  schedules: unknown;
  created_at: string | null;
};

export type BootcampMembership = {
  id: string;
  workspace_id: string;
  profile_id: string;
  group_name: string | null;
  group_wa_link: string | null;
  is_leader: boolean | null;
  attendance: Record<string, unknown> | null;
  plus_points: Record<string, unknown> | null;
  credential_no: string | null;
  certificate_url: string | null;
  role: string | null;
};

function throwIfError(error: { message: string } | null, operation: string) {
  if (error) {
    throw new Error(`${operation} failed.`);
  }
}

function isPublished(value: unknown): boolean {
  return ['true', 't', '1', 'yes'].includes(String(value ?? '').toLowerCase());
}

export function normalizeSchedules(value: unknown): Array<{
  title: string;
  date: string | null;
  time: string | null;
  meet_link: string | null;
}> {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    const schedule = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return {
      title: typeof schedule.title === 'string' ? schedule.title : 'Kelas',
      date: typeof schedule.date === 'string' ? schedule.date : null,
      time: typeof schedule.time === 'string' ? schedule.time : null,
      meet_link: typeof schedule.meet_link === 'string' ? schedule.meet_link : null,
    };
  });
}

export async function getBootcampOverview(viewer: Viewer) {
  const admin = getSupabaseAdminClient();
  const { data: batchRows, error: batchError } = await admin
    .from('v2_workspaces')
    .select('id, name, description, status, start_date, end_date, max_members, schedules, created_at')
    .eq('type', 'batch')
    .order('created_at', { ascending: false });
  throwIfError(batchError, 'Loading Bootcamp batches');

  const batches = (batchRows ?? []) as BootcampBatch[];
  const batchIds = batches.map((batch) => batch.id);
  if (batchIds.length === 0) {
    return { batches, memberships: [] as BootcampMembership[], studentCounts: new Map<string, number>() };
  }

  const membershipQuery = viewer.isAdmin
    ? admin
      .from('v2_memberships')
      .select('id, workspace_id, profile_id, group_name, group_wa_link, is_leader, attendance, plus_points, credential_no, certificate_url, role')
      .in('workspace_id', batchIds)
    : admin
      .from('v2_memberships')
      .select('id, workspace_id, profile_id, group_name, group_wa_link, is_leader, attendance, plus_points, credential_no, certificate_url, role')
      .eq('profile_id', viewer.id)
      .in('workspace_id', batchIds);

  const { data: membershipRows, error: membershipError } = await membershipQuery;
  throwIfError(membershipError, 'Loading Bootcamp memberships');

  const memberships = (membershipRows ?? []) as BootcampMembership[];
  // A student must never receive the names, schedule metadata, or status of
  // batches they do not belong to. The service-role repository performs the
  // membership check server-side, and this filter keeps the serialized
  // Server Component props equally narrow.
  const visibleBatches = viewer.isAdmin
    ? batches
    : batches.filter((batch) => memberships.some((membership) => membership.workspace_id === batch.id));
  const studentCounts = new Map<string, number>();
  for (const membership of memberships) {
    studentCounts.set(membership.workspace_id, (studentCounts.get(membership.workspace_id) ?? 0) + 1);
  }

  return { batches: visibleBatches, memberships, studentCounts };
}

export async function getBootcampWorkspace(viewer: Viewer, workspaceId: string) {
  const admin = getSupabaseAdminClient();
  const { data: workspace, error: workspaceError } = await admin
    .from('v2_workspaces')
    .select('id, name, description, status, start_date, end_date, max_members, schedules, created_at')
    .eq('id', workspaceId)
    .eq('type', 'batch')
    .maybeSingle();
  throwIfError(workspaceError, 'Loading Bootcamp workspace');
  if (!workspace) return null;

  const { data: membership, error: membershipError } = await admin
    .from('v2_memberships')
    .select('id, workspace_id, profile_id, group_name, group_wa_link, is_leader, attendance, plus_points, credential_no, certificate_url, role')
    .eq('workspace_id', workspaceId)
    .eq('profile_id', viewer.id)
    .maybeSingle();
  throwIfError(membershipError, 'Checking Bootcamp membership');

  if (!viewer.isAdmin && !membership) return null;

  const curriculumRequest = admin
    .from('v2_curriculums')
    .select('id, title, description, content_rich, type, module_name, due_date, video_url, assets_json, is_published, points_weight, grading_mode, created_at, assignment_group_id')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });
  const announcementsRequest = admin
    .from('v2_announcements')
    .select('id, title, summary, content, category, is_pinned, created_at, updated_at')
    .eq('workspace_id', workspaceId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  // The service client is used only after this server function has verified
  // the authenticated viewer and membership. Students receive their own
  // records; a database-authorized admin receives the batch matrix needed to
  // review historical work without changing it.
  const submissionRequest = viewer.isAdmin
    ? admin
      .from('v2_submissions')
      .select('id, curriculum_id, profile_id, file_link, status, grade, mentor_feedback, is_feedback_read, graded_at, created_at, criteria_scores, is_cloned, assignment_group_id, v2_profiles!v2_submissions_profile_id_fkey(full_name, username)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    : admin
      .from('v2_submissions')
      .select('id, curriculum_id, profile_id, file_link, status, grade, mentor_feedback, is_feedback_read, graded_at, created_at, criteria_scores, is_cloned, assignment_group_id')
      .eq('workspace_id', workspaceId)
      .eq('profile_id', viewer.id)
      .order('created_at', { ascending: false });
  const quizRequest = viewer.isAdmin
    ? admin
      .from('v2_quiz_results')
      .select('id, curriculum_id, profile_id, score, created_at, v2_profiles(full_name, username)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    : admin
      .from('v2_quiz_results')
      .select('id, curriculum_id, profile_id, score, created_at')
      .eq('workspace_id', workspaceId)
      .eq('profile_id', viewer.id)
      .order('created_at', { ascending: false });

  const [curriculumResult, announcementsResult, submissionsResult, quizResult] = await Promise.all([
    curriculumRequest,
    announcementsRequest,
    submissionRequest,
    quizRequest,
  ]);
  throwIfError(curriculumResult.error, 'Loading curriculum');
  throwIfError(announcementsResult.error, 'Loading announcements');
  throwIfError(submissionsResult.error, 'Loading submissions');
  throwIfError(quizResult.error, 'Loading quiz results');

  const curriculum = ((curriculumResult.data ?? []) as Array<Record<string, unknown>>)
    .filter((item) => viewer.isAdmin || isPublished(item.is_published));

  let students: Array<Record<string, unknown>> = [];
  if (viewer.isAdmin) {
    const { data: studentRows, error: studentError } = await admin
      .from('v2_memberships')
      .select('id, profile_id, group_name, is_leader, credential_no, attendance, plus_points, v2_profiles(full_name, username, avatar_url, email)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });
    throwIfError(studentError, 'Loading students');
    students = (studentRows ?? []) as Array<Record<string, unknown>>;
  }

  return {
    batch: workspace as BootcampBatch,
    membership: membership as BootcampMembership | null,
    curriculum,
    announcements: (announcementsResult.data ?? []) as Array<Record<string, unknown>>,
    submissions: (submissionsResult.data ?? []) as Array<Record<string, unknown>>,
    quizResults: (quizResult.data ?? []) as Array<Record<string, unknown>>,
    students,
  };
}

export async function getQuizTemplates() {
  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from('v2_quiz_templates')
    .select('id, title, description, category, questions_json, created_at, updated_at')
    .order('updated_at', { ascending: false });
  throwIfError(error, 'Loading quiz templates');
  return (data ?? []) as Array<Record<string, unknown>>;
}
