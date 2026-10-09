import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminV2 } from '@/lib/supabaseAdmin';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID_STATUSES = new Set(['pending', 'in_review', 'completed']);

type GradeUpdate = {
  workspaceId: string;
  setGrade: boolean;
  grade: number | null;
  setStatus: boolean;
  status: string | null;
  setFeedback: boolean;
  feedback: string | null;
  setCriteriaScores: boolean;
  criteriaScores: Record<string, number> | null;
};

type GradingStaff = {
  admin: NonNullable<typeof supabaseAdminV2>;
  userId: string;
};

class InputError extends Error {}

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function hasOwn(input: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(input, key);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function parseGradeUpdate(value: unknown): GradeUpdate {
  if (!isRecord(value)) throw new InputError('Data penilaian tidak valid.');

  const workspaceId = value.workspaceId;
  if (typeof workspaceId !== 'string' || !UUID_PATTERN.test(workspaceId)) {
    throw new InputError('Batch tidak valid.');
  }

  const setGrade = hasOwn(value, 'grade');
  let grade: number | null = null;
  if (setGrade) {
    const numeric = typeof value.grade === 'number' ? value.grade : Number(value.grade);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
      throw new InputError('Nilai harus berada pada rentang 0–100.');
    }
    grade = Math.round(numeric);
  }

  const setStatus = hasOwn(value, 'status');
  let status: string | null = null;
  if (setStatus) {
    if (typeof value.status !== 'string' || !VALID_STATUSES.has(value.status)) {
      throw new InputError('Status submission tidak valid.');
    }
    status = value.status;
  }

  const setFeedback = hasOwn(value, 'mentorFeedback');
  let feedback: string | null = null;
  if (setFeedback) {
    if (value.mentorFeedback !== null && typeof value.mentorFeedback !== 'string') {
      throw new InputError('Feedback mentor tidak valid.');
    }
    feedback = typeof value.mentorFeedback === 'string' ? value.mentorFeedback.trim() : null;
    if (feedback && feedback.length > 10_000) {
      throw new InputError('Feedback mentor terlalu panjang.');
    }
  }

  const setCriteriaScores = hasOwn(value, 'criteriaScores');
  let criteriaScores: Record<string, number> | null = null;
  if (setCriteriaScores && value.criteriaScores !== null) {
    if (!isRecord(value.criteriaScores)) throw new InputError('Nilai rubrik tidak valid.');
    const entries = Object.entries(value.criteriaScores);
    if (entries.length > 50) throw new InputError('Maksimal 50 kriteria dapat dinilai.');

    criteriaScores = {};
    for (const [criterion, rawScore] of entries) {
      const name = criterion.trim();
      const numeric = typeof rawScore === 'number' ? rawScore : Number(rawScore);
      if (!name || name.length > 180 || !Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
        throw new InputError('Nilai rubrik harus berupa angka 0–100.');
      }
      criteriaScores[name] = Math.round(numeric);
    }
  }

  if (!setGrade && !setStatus && !setFeedback && !setCriteriaScores) {
    throw new InputError('Tidak ada perubahan penilaian untuk disimpan.');
  }

  return {
    workspaceId,
    setGrade,
    grade,
    setStatus,
    status,
    setFeedback,
    feedback,
    setCriteriaScores,
    criteriaScores,
  };
}

function accessToken(request: NextRequest) {
  const value = request.headers.get('authorization');
  if (!value?.startsWith('Bearer ')) return null;
  const token = value.slice('Bearer '.length).trim();
  return token || null;
}

function isActiveGroupName(value: unknown): value is string {
  return typeof value === 'string'
    && value.trim().length > 0
    && value.trim().toLowerCase() !== 'unassigned';
}

function isSafeSubmissionUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

function parseTargetProfileIds(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new InputError('Pilih minimal satu anggota grup.');
  }
  if (value.length > 50) {
    throw new InputError('Maksimal 50 anggota dapat dinilai sekaligus.');
  }

  const ids = value.map((id) => {
    if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
      throw new InputError('Daftar anggota grup tidak valid.');
    }
    return id;
  });

  if (new Set(ids).size !== ids.length) {
    throw new InputError('Daftar anggota grup memuat anggota yang duplikat.');
  }

  return ids;
}

async function requireGradingStaff(request: NextRequest): Promise<GradingStaff | { response: NextResponse }> {
  if (!supabaseAdminV2) {
    return { response: json({ success: false, error: 'Layanan penilaian belum dikonfigurasi.' }, 503) };
  }

  const token = accessToken(request);
  if (!token) return { response: json({ success: false, error: 'Sesi login diperlukan.' }, 401) };

  const { data: userData, error: userError } = await supabaseAdminV2.auth.getUser(token);
  const user = userData.user;
  if (userError || !user) {
    return { response: json({ success: false, error: 'Sesi login tidak valid.' }, 401) };
  }

  const { data: staffRole, error: staffError } = await supabaseAdminV2
    .from('platform_role_assignments')
    .select('id')
    .eq('profile_id', user.id)
    .is('revoked_at', null)
    .in('role', ['admin', 'mentor'])
    .limit(1)
    .maybeSingle();

  if (staffError) {
    console.error('Unable to verify Bootcamp grading role', staffError);
    return { response: json({ success: false, error: 'Role penilai tidak dapat diverifikasi.' }, 500) };
  }
  if (!staffRole) {
    return { response: json({ success: false, error: 'Hanya admin atau mentor yang dapat memberi nilai.' }, 403) };
  }

  return { admin: supabaseAdminV2, userId: user.id };
}

async function recordAuditedGrade(
  staff: GradingStaff,
  submissionId: string,
  update: GradeUpdate,
  reason: string,
) {
  const { error } = await staff.admin.rpc('record_bootcamp_submission_grade', {
    p_workspace_id: update.workspaceId,
    p_submission_id: submissionId,
    p_actor_id: staff.userId,
    p_set_grade: update.setGrade,
    p_grade: update.grade,
    p_set_status: update.setStatus,
    p_status: update.status,
    p_set_feedback: update.setFeedback,
    p_feedback: update.feedback,
    p_set_criteria_scores: update.setCriteriaScores,
    p_criteria_scores: update.criteriaScores,
    p_reason: reason,
  });

  return error;
}

function auditedGradeFailure(error: { message?: string } | null) {
  const message = error?.message || '';
  if (/Submission not found in this Bootcamp batch/i.test(message)) {
    return { status: 404, error: 'Submission tidak ditemukan pada batch ini.' };
  }
  if (/A database-backed admin or mentor role is required/i.test(message)) {
    return { status: 403, error: 'Role penilai tidak diizinkan.' };
  }
  if (/Grade must be between|Submission status is invalid|Mentor feedback is too long|Criteria scores/i.test(message)) {
    return { status: 400, error: 'Data penilaian tidak valid.' };
  }
  return { status: 500, error: 'Nilai belum dapat disimpan. Silakan coba lagi.' };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const staff = await requireGradingStaff(request);
  if ('response' in staff) return staff.response;

  const { id: submissionId } = await params;
  if (!UUID_PATTERN.test(submissionId)) {
    return json({ success: false, error: 'Submission tidak valid.' }, 400);
  }

  let update: GradeUpdate;
  try {
    update = parseGradeUpdate(await request.json());
  } catch (error) {
    const message = error instanceof InputError ? error.message : 'Data penilaian tidak valid.';
    return json({ success: false, error: message }, 400);
  }

  const gradeError = await recordAuditedGrade(
    staff,
    submissionId,
    update,
    'Penilaian dari Batch Management',
  );

  if (gradeError) {
    console.error('Audited Bootcamp grading failed', gradeError);
    const failure = auditedGradeFailure(gradeError);
    return json({ success: false, error: failure.error }, failure.status);
  }

  const { data: submission, error: readError } = await staff.admin
    .from('v2_submissions')
    .select('id, workspace_id, profile_id, curriculum_id, status, grade, mentor_feedback, criteria_scores, graded_at')
    .eq('id', submissionId)
    .eq('workspace_id', update.workspaceId)
    .maybeSingle();

  if (readError || !submission) {
    if (readError) console.error('Unable to read audited Bootcamp grade', readError);
    return json({ success: false, error: 'Nilai tersimpan, tetapi hasil terbaru belum dapat dimuat.' }, 500);
  }

  return json({ success: true, submission }, 200);
}

/**
 * Applies one reviewed group submission to selected, active members of that
 * exact membership group. Clones are made only on the server, then each
 * protected grade update is written through the database audit workflow.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const staff = await requireGradingStaff(request);
  if ('response' in staff) return staff.response;

  const { id: sourceSubmissionId } = await params;
  if (!UUID_PATTERN.test(sourceSubmissionId)) {
    return json({ success: false, error: 'Submission sumber tidak valid.' }, 400);
  }

  let update: GradeUpdate;
  let targetProfileIds: string[];
  try {
    const body = await request.json();
    update = parseGradeUpdate(body);
    targetProfileIds = parseTargetProfileIds(isRecord(body) ? body.targetProfileIds : undefined);

    if (!update.setGrade || update.grade === null) {
      throw new InputError('Nilai kelompok wajib diisi.');
    }
    if (!update.setStatus || update.status !== 'completed') {
      throw new InputError('Nilai kelompok harus disimpan sebagai completed.');
    }
  } catch (error) {
    const message = error instanceof InputError ? error.message : 'Data nilai kelompok tidak valid.';
    return json({ success: false, error: message }, 400);
  }

  const { data: source, error: sourceError } = await staff.admin
    .from('v2_submissions')
    .select('id, workspace_id, curriculum_id, profile_id, file_link, assignment_group_id')
    .eq('id', sourceSubmissionId)
    .eq('workspace_id', update.workspaceId)
    .maybeSingle();

  if (sourceError) {
    console.error('Unable to read group grade source submission', sourceError);
    return json({ success: false, error: 'Submission sumber belum dapat dimuat.' }, 500);
  }
  if (!source) {
    return json({ success: false, error: 'Submission sumber tidak ditemukan pada batch ini.' }, 404);
  }
  if (!isSafeSubmissionUrl(source.file_link)) {
    return json({ success: false, error: 'Tautan submission sumber tidak valid untuk disinkronkan.' }, 400);
  }

  const { data: sourceMembership, error: sourceMembershipError } = await staff.admin
    .from('v2_memberships')
    .select('profile_id, group_name, role')
    .eq('workspace_id', update.workspaceId)
    .eq('profile_id', source.profile_id)
    .maybeSingle();

  if (sourceMembershipError) {
    console.error('Unable to verify source membership for group grade', sourceMembershipError);
    return json({ success: false, error: 'Keanggotaan grup sumber belum dapat diverifikasi.' }, 500);
  }
  if (!sourceMembership || sourceMembership.role === 'removed' || !isActiveGroupName(sourceMembership.group_name)) {
    return json({ success: false, error: 'Submission sumber tidak berasal dari grup aktif.' }, 400);
  }

  const sourceGroupName = sourceMembership.group_name.trim();
  const { data: targetMemberships, error: membershipsError } = await staff.admin
    .from('v2_memberships')
    .select('profile_id, group_name, role')
    .eq('workspace_id', update.workspaceId)
    .in('profile_id', targetProfileIds);

  if (membershipsError) {
    console.error('Unable to verify target memberships for group grade', membershipsError);
    return json({ success: false, error: 'Keanggotaan grup belum dapat diverifikasi.' }, 500);
  }

  const membershipsByProfile = new Map(
    (targetMemberships || [])
      .filter((membership) => typeof membership.profile_id === 'string')
      .map((membership) => [membership.profile_id, membership]),
  );
  const invalidMember = targetProfileIds.some((profileId) => {
    const membership = membershipsByProfile.get(profileId);
    return !membership
      || membership.role === 'removed'
      || !isActiveGroupName(membership.group_name)
      || membership.group_name.trim() !== sourceGroupName;
  });

  if (invalidMember) {
    return json({
      success: false,
      error: 'Semua penerima nilai harus merupakan anggota aktif dari grup submission sumber.',
    }, 400);
  }

  const { data: existingSubmissions, error: existingError } = await staff.admin
    .from('v2_submissions')
    .select('id, profile_id, created_at')
    .eq('workspace_id', update.workspaceId)
    .eq('curriculum_id', source.curriculum_id)
    .in('profile_id', targetProfileIds)
    .order('created_at', { ascending: false });

  if (existingError) {
    console.error('Unable to read existing group submissions', existingError);
    return json({ success: false, error: 'Submission anggota belum dapat dimuat.' }, 500);
  }

  const submissionByProfile = new Map<string, string>();
  for (const submission of existingSubmissions || []) {
    if (
      typeof submission.profile_id === 'string'
      && typeof submission.id === 'string'
      && !submissionByProfile.has(submission.profile_id)
    ) {
      submissionByProfile.set(submission.profile_id, submission.id);
    }
  }

  let createdCount = 0;
  let updatedCount = 0;
  let gradedCount = 0;

  for (const profileId of targetProfileIds) {
    let submissionId = submissionByProfile.get(profileId);
    if (submissionId) {
      updatedCount += 1;
    } else {
      const { data: clone, error: cloneError } = await staff.admin
        .from('v2_submissions')
        .insert({
          workspace_id: update.workspaceId,
          curriculum_id: source.curriculum_id,
          profile_id: profileId,
          file_link: source.file_link,
          status: 'pending',
          is_cloned: true,
          cloned_from_submission_id: source.id,
          submitted_by_profile_id: source.profile_id,
          assignment_group_id: source.assignment_group_id,
        })
        .select('id')
        .single();

      if (cloneError || !clone?.id) {
        console.error('Unable to create server-side group submission clone', cloneError);
        return json({
          success: false,
          error: `Sinkronisasi berhenti setelah ${gradedCount} anggota. Silakan coba lagi untuk melanjutkan.`,
          gradedCount,
          createdCount,
          updatedCount,
        }, 500);
      }

      submissionId = clone.id;
      createdCount += 1;
    }

    if (!submissionId) {
      return json({
        success: false,
        error: 'Submission anggota belum dapat disiapkan untuk diberi nilai.',
        gradedCount,
        createdCount,
        updatedCount,
      }, 500);
    }

    const targetUpdate: GradeUpdate = profileId === source.profile_id
      ? update
      : {
        ...update,
        setFeedback: true,
        feedback: '[GROUP SYNC] Nilai kelompok disinkronkan dari submission sumber.',
      };
    const gradeError = await recordAuditedGrade(
      staff,
      submissionId,
      targetUpdate,
      'Sinkronisasi nilai kelompok dari Batch Management',
    );

    if (gradeError) {
      console.error('Audited group grading failed', gradeError);
      const failure = auditedGradeFailure(gradeError);
      return json({
        success: false,
        error: `Sinkronisasi berhenti setelah ${gradedCount} anggota: ${failure.error}`,
        gradedCount,
        createdCount,
        updatedCount,
      }, failure.status);
    }

    gradedCount += 1;
  }

  return json({
    success: true,
    gradedCount,
    createdCount,
    updatedCount,
  }, 200);
}
