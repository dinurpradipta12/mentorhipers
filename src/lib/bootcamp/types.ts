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

export type BootcampAssignmentGroup = {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string | null;
  members: Array<{ profile_id: string }>;
};
