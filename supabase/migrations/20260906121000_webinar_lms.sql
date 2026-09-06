-- Ruang Campus: isolated public Webinar LMS schema.
--
-- Preconditions for applying this migration:
-- 1. Create and verify a full logical database dump.
-- 2. Apply 20260906120000_platform_roles.sql.
-- 3. Bootstrap at least one explicitly approved administrator.
--
-- This migration adds new tables only. It does not use or modify v2_workspaces,
-- v2_memberships, v2_agency_*, historical grades, attendance, or submissions.

create table if not exists public.public_webinars (
  id uuid primary key default gen_random_uuid(),
  public_code text not null,
  title text not null,
  description text not null default '',
  instructor_name text,
  category text,
  cover_url text,
  cover_storage_path text,
  status text not null default 'draft',
  published_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.webinar_sections (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references public.public_webinars(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.webinar_lessons (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references public.public_webinars(id) on delete cascade,
  section_id uuid not null references public.webinar_sections(id) on delete cascade,
  title text not null,
  lesson_slug text not null,
  description text,
  video_provider text not null,
  video_url text,
  storage_path text,
  thumbnail_url text,
  thumbnail_storage_path text,
  duration_seconds integer,
  content_rich text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.webinar_resources (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references public.public_webinars(id) on delete cascade,
  lesson_id uuid not null references public.webinar_lessons(id) on delete cascade,
  title text not null,
  resource_type text not null default 'link',
  public_url text,
  storage_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.webinar_audit_logs (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid references public.public_webinars(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

-- `create table if not exists` is intentionally safe if a prior interrupted
-- deploy created a table. In that case, add any missing FK explicitly because
-- PostgreSQL has no `add constraint if not exists` syntax.
do $webinar_foreign_keys$
begin
  if not exists (select 1 from pg_constraint where conname = 'public_webinars_created_by_fkey' and conrelid = 'public.public_webinars'::regclass) then
    alter table public.public_webinars add constraint public_webinars_created_by_fkey foreign key (created_by) references auth.users(id) on delete restrict;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_sections_webinar_id_fkey' and conrelid = 'public.webinar_sections'::regclass) then
    alter table public.webinar_sections add constraint webinar_sections_webinar_id_fkey foreign key (webinar_id) references public.public_webinars(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_lessons_webinar_id_fkey' and conrelid = 'public.webinar_lessons'::regclass) then
    alter table public.webinar_lessons add constraint webinar_lessons_webinar_id_fkey foreign key (webinar_id) references public.public_webinars(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_lessons_section_id_fkey' and conrelid = 'public.webinar_lessons'::regclass) then
    alter table public.webinar_lessons add constraint webinar_lessons_section_id_fkey foreign key (section_id) references public.webinar_sections(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_resources_webinar_id_fkey' and conrelid = 'public.webinar_resources'::regclass) then
    alter table public.webinar_resources add constraint webinar_resources_webinar_id_fkey foreign key (webinar_id) references public.public_webinars(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_resources_lesson_id_fkey' and conrelid = 'public.webinar_resources'::regclass) then
    alter table public.webinar_resources add constraint webinar_resources_lesson_id_fkey foreign key (lesson_id) references public.webinar_lessons(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_audit_logs_webinar_id_fkey' and conrelid = 'public.webinar_audit_logs'::regclass) then
    alter table public.webinar_audit_logs add constraint webinar_audit_logs_webinar_id_fkey foreign key (webinar_id) references public.public_webinars(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_audit_logs_actor_id_fkey' and conrelid = 'public.webinar_audit_logs'::regclass) then
    alter table public.webinar_audit_logs add constraint webinar_audit_logs_actor_id_fkey foreign key (actor_id) references auth.users(id) on delete set null;
  end if;
end
$webinar_foreign_keys$;

do $webinar_constraints$
begin
  if not exists (select 1 from pg_constraint where conname = 'public_webinars_public_code_key' and conrelid = 'public.public_webinars'::regclass) then
    alter table public.public_webinars add constraint public_webinars_public_code_key unique (public_code);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'public_webinars_public_code_format_check' and conrelid = 'public.public_webinars'::regclass) then
    alter table public.public_webinars add constraint public_webinars_public_code_format_check check (public_code ~ '^[A-Za-z0-9_-]{7,12}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'public_webinars_title_not_blank_check' and conrelid = 'public.public_webinars'::regclass) then
    alter table public.public_webinars add constraint public_webinars_title_not_blank_check check (char_length(btrim(title)) between 1 and 180);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'public_webinars_status_check' and conrelid = 'public.public_webinars'::regclass) then
    alter table public.public_webinars add constraint public_webinars_status_check check (status in ('draft', 'published', 'archived'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'public_webinars_published_at_check' and conrelid = 'public.public_webinars'::regclass) then
    alter table public.public_webinars add constraint public_webinars_published_at_check check (status <> 'published' or published_at is not null);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'public_webinars_cover_source_check' and conrelid = 'public.public_webinars'::regclass) then
    alter table public.public_webinars add constraint public_webinars_cover_source_check check (num_nonnulls(cover_url, cover_storage_path) <= 1);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_sections_title_not_blank_check' and conrelid = 'public.webinar_sections'::regclass) then
    alter table public.webinar_sections add constraint webinar_sections_title_not_blank_check check (char_length(btrim(title)) between 1 and 180);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_sections_sort_order_check' and conrelid = 'public.webinar_sections'::regclass) then
    alter table public.webinar_sections add constraint webinar_sections_sort_order_check check (sort_order >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_lessons_lesson_slug_key' and conrelid = 'public.webinar_lessons'::regclass) then
    alter table public.webinar_lessons add constraint webinar_lessons_lesson_slug_key unique (webinar_id, lesson_slug);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_lessons_title_not_blank_check' and conrelid = 'public.webinar_lessons'::regclass) then
    alter table public.webinar_lessons add constraint webinar_lessons_title_not_blank_check check (char_length(btrim(title)) between 1 and 180);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_lessons_slug_format_check' and conrelid = 'public.webinar_lessons'::regclass) then
    alter table public.webinar_lessons add constraint webinar_lessons_slug_format_check check (lesson_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_lessons_provider_check' and conrelid = 'public.webinar_lessons'::regclass) then
    alter table public.webinar_lessons add constraint webinar_lessons_provider_check check (video_provider in ('youtube', 'vimeo', 'direct', 'storage'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_lessons_video_source_check' and conrelid = 'public.webinar_lessons'::regclass) then
    alter table public.webinar_lessons add constraint webinar_lessons_video_source_check check ((video_provider = 'storage' and storage_path is not null and video_url is null) or (video_provider <> 'storage' and video_url is not null and storage_path is null));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_lessons_duration_check' and conrelid = 'public.webinar_lessons'::regclass) then
    alter table public.webinar_lessons add constraint webinar_lessons_duration_check check (duration_seconds is null or duration_seconds >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_lessons_sort_order_check' and conrelid = 'public.webinar_lessons'::regclass) then
    alter table public.webinar_lessons add constraint webinar_lessons_sort_order_check check (sort_order >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_resources_title_not_blank_check' and conrelid = 'public.webinar_resources'::regclass) then
    alter table public.webinar_resources add constraint webinar_resources_title_not_blank_check check (char_length(btrim(title)) between 1 and 180);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_resources_type_check' and conrelid = 'public.webinar_resources'::regclass) then
    alter table public.webinar_resources add constraint webinar_resources_type_check check (resource_type in ('link', 'file', 'worksheet', 'slide', 'download'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_resources_source_check' and conrelid = 'public.webinar_resources'::regclass) then
    alter table public.webinar_resources add constraint webinar_resources_source_check check (num_nonnulls(public_url, storage_path) = 1);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'webinar_resources_sort_order_check' and conrelid = 'public.webinar_resources'::regclass) then
    alter table public.webinar_resources add constraint webinar_resources_sort_order_check check (sort_order >= 0);
  end if;
end
$webinar_constraints$;

create index if not exists public_webinars_published_at_idx
  on public.public_webinars (published_at desc)
  where status = 'published';
create index if not exists public_webinars_created_by_idx
  on public.public_webinars (created_by, updated_at desc);
create index if not exists webinar_sections_webinar_sort_idx
  on public.webinar_sections (webinar_id, sort_order, id);
create index if not exists webinar_lessons_webinar_sort_idx
  on public.webinar_lessons (webinar_id, sort_order, id);
create index if not exists webinar_lessons_section_sort_idx
  on public.webinar_lessons (section_id, sort_order, id);
create index if not exists webinar_resources_webinar_lesson_sort_idx
  on public.webinar_resources (webinar_id, lesson_id, sort_order, id);
create index if not exists webinar_resources_lesson_sort_idx
  on public.webinar_resources (lesson_id, sort_order, id);
create index if not exists webinar_audit_logs_webinar_created_at_idx
  on public.webinar_audit_logs (webinar_id, created_at desc);
create index if not exists webinar_audit_logs_actor_created_at_idx
  on public.webinar_audit_logs (actor_id, created_at desc);

create or replace function public.set_webinar_updated_at()
returns trigger
language plpgsql
set search_path = public
as $set_webinar_updated_at$
begin
  new.updated_at = now();
  return new;
end;
$set_webinar_updated_at$;

create or replace function public.assert_webinar_lesson_section()
returns trigger
language plpgsql
set search_path = public
as $assert_webinar_lesson_section$
declare
  expected_webinar_id uuid;
begin
  select webinar_id into expected_webinar_id
  from public.webinar_sections
  where id = new.section_id;

  if expected_webinar_id is null or expected_webinar_id is distinct from new.webinar_id then
    raise exception 'Lesson section must belong to the same webinar';
  end if;

  return new;
end;
$assert_webinar_lesson_section$;

create or replace function public.assert_webinar_resource_lesson()
returns trigger
language plpgsql
set search_path = public
as $assert_webinar_resource_lesson$
declare
  expected_webinar_id uuid;
begin
  select webinar_id into expected_webinar_id
  from public.webinar_lessons
  where id = new.lesson_id;

  if expected_webinar_id is null or expected_webinar_id is distinct from new.webinar_id then
    raise exception 'Resource lesson must belong to the same webinar';
  end if;

  return new;
end;
$assert_webinar_resource_lesson$;

create or replace function public.prevent_webinar_public_code_change()
returns trigger
language plpgsql
set search_path = public
as $prevent_webinar_public_code_change$
begin
  if new.public_code is distinct from old.public_code then
    raise exception 'public_code is stable and cannot be changed';
  end if;
  return new;
end;
$prevent_webinar_public_code_change$;

drop trigger if exists public_webinars_set_updated_at on public.public_webinars;
create trigger public_webinars_set_updated_at
before update on public.public_webinars
for each row execute function public.set_webinar_updated_at();

drop trigger if exists webinar_sections_set_updated_at on public.webinar_sections;
create trigger webinar_sections_set_updated_at
before update on public.webinar_sections
for each row execute function public.set_webinar_updated_at();

drop trigger if exists webinar_lessons_set_updated_at on public.webinar_lessons;
create trigger webinar_lessons_set_updated_at
before update on public.webinar_lessons
for each row execute function public.set_webinar_updated_at();

drop trigger if exists webinar_lessons_validate_section on public.webinar_lessons;
create trigger webinar_lessons_validate_section
before insert or update of webinar_id, section_id on public.webinar_lessons
for each row execute function public.assert_webinar_lesson_section();

drop trigger if exists webinar_resources_validate_lesson on public.webinar_resources;
create trigger webinar_resources_validate_lesson
before insert or update of webinar_id, lesson_id on public.webinar_resources
for each row execute function public.assert_webinar_resource_lesson();

drop trigger if exists public_webinars_preserve_public_code on public.public_webinars;
create trigger public_webinars_preserve_public_code
before update of public_code on public.public_webinars
for each row execute function public.prevent_webinar_public_code_change();

alter table public.public_webinars enable row level security;
alter table public.webinar_sections enable row level security;
alter table public.webinar_lessons enable row level security;
alter table public.webinar_resources enable row level security;
alter table public.webinar_audit_logs enable row level security;

drop policy if exists public_webinars_admin_only on public.public_webinars;
create policy public_webinars_admin_only on public.public_webinars
  for all to authenticated
  using ((select public.has_platform_role(array['admin', 'mentor']::text[])))
  with check ((select public.has_platform_role(array['admin', 'mentor']::text[])));

drop policy if exists webinar_sections_admin_only on public.webinar_sections;
create policy webinar_sections_admin_only on public.webinar_sections
  for all to authenticated
  using ((select public.has_platform_role(array['admin', 'mentor']::text[])))
  with check ((select public.has_platform_role(array['admin', 'mentor']::text[])));

drop policy if exists webinar_lessons_admin_only on public.webinar_lessons;
create policy webinar_lessons_admin_only on public.webinar_lessons
  for all to authenticated
  using ((select public.has_platform_role(array['admin', 'mentor']::text[])))
  with check ((select public.has_platform_role(array['admin', 'mentor']::text[])));

drop policy if exists webinar_resources_admin_only on public.webinar_resources;
create policy webinar_resources_admin_only on public.webinar_resources
  for all to authenticated
  using ((select public.has_platform_role(array['admin', 'mentor']::text[])))
  with check ((select public.has_platform_role(array['admin', 'mentor']::text[])));

drop policy if exists webinar_audit_logs_admin_only on public.webinar_audit_logs;
create policy webinar_audit_logs_admin_only on public.webinar_audit_logs
  for select to authenticated
  using ((select public.has_platform_role(array['admin', 'mentor']::text[])));

-- Public delivery uses a server route that filters by `status = published` and
-- allowlists output columns. There is intentionally no anon table policy.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'webinar-media',
  'webinar-media',
  false,
  104857600,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4']
)
on conflict (id) do nothing;

drop policy if exists webinar_media_admin_only on storage.objects;
create policy webinar_media_admin_only on storage.objects
  for all to authenticated
  using (
    bucket_id = 'webinar-media'
    and (select public.has_platform_role(array['admin', 'mentor']::text[]))
  )
  with check (
    bucket_id = 'webinar-media'
    and (select public.has_platform_role(array['admin', 'mentor']::text[]))
  );
