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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!supabaseAdminV2) {
    return json({ success: false, error: 'Layanan penilaian belum dikonfigurasi.' }, 503);
  }

  const token = accessToken(request);
  if (!token) return json({ success: false, error: 'Sesi login diperlukan.' }, 401);

  const { data: userData, error: userError } = await supabaseAdminV2.auth.getUser(token);
  const user = userData.user;
  if (userError || !user) return json({ success: false, error: 'Sesi login tidak valid.' }, 401);

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
    return json({ success: false, error: 'Role penilai tidak dapat diverifikasi.' }, 500);
  }
  if (!staffRole) return json({ success: false, error: 'Hanya admin atau mentor yang dapat memberi nilai.' }, 403);

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

  const { error: gradeError } = await supabaseAdminV2.rpc('record_bootcamp_submission_grade', {
    p_workspace_id: update.workspaceId,
    p_submission_id: submissionId,
    p_actor_id: user.id,
    p_set_grade: update.setGrade,
    p_grade: update.grade,
    p_set_status: update.setStatus,
    p_status: update.status,
    p_set_feedback: update.setFeedback,
    p_feedback: update.feedback,
    p_set_criteria_scores: update.setCriteriaScores,
    p_criteria_scores: update.criteriaScores,
    p_reason: 'Penilaian dari Batch Management',
  });

  if (gradeError) {
    console.error('Audited Bootcamp grading failed', gradeError);
    if (/Submission not found in this Bootcamp batch/i.test(gradeError.message)) {
      return json({ success: false, error: 'Submission tidak ditemukan pada batch ini.' }, 404);
    }
    if (/A database-backed admin or mentor role is required/i.test(gradeError.message)) {
      return json({ success: false, error: 'Role penilai tidak diizinkan.' }, 403);
    }
    if (/Grade must be between|Submission status is invalid|Mentor feedback is too long|Criteria scores/i.test(gradeError.message)) {
      return json({ success: false, error: 'Data penilaian tidak valid.' }, 400);
    }
    return json({ success: false, error: 'Nilai belum dapat disimpan. Silakan coba lagi.' }, 500);
  }

  const { data: submission, error: readError } = await supabaseAdminV2
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
