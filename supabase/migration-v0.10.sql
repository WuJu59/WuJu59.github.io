-- ============================================================
-- v0.10 迁移：小游戏（无数据库）、耳扒视频、Bug 反馈
-- 现有数据库执行这一份即可（新装数据库直接跑 schema.sql）
-- 注意：以下权限仍是账号系统前的临时宽松方案
-- ============================================================

-- 1) 耳扒视频表
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  note text not null default '',
  url text not null,
  created_at timestamptz not null default now()
);

-- 2) Bug 反馈表
create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  page text not null default '',
  contact text not null default '',
  created_at timestamptz not null default now()
);

alter table public.videos enable row level security;
alter table public.bug_reports enable row level security;

-- 视频：公开可看；临时允许匿名增删改（账号系统前）
create policy "videos select" on public.videos for select using (true);
create policy "videos insert" on public.videos for insert with check (true);
create policy "videos update" on public.videos for update using (true) with check (true);
create policy "videos delete" on public.videos for delete using (true);

-- Bug 反馈：公开可提交；临时允许匿名查看/删除（账号系统前）
create policy "bug_reports select" on public.bug_reports for select using (true);
create policy "bug_reports insert" on public.bug_reports for insert with check (true);
create policy "bug_reports update" on public.bug_reports for update using (true) with check (true);
create policy "bug_reports delete" on public.bug_reports for delete using (true);

-- 3) 视频存储桶（公开）
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

drop policy if exists "videos public read" on storage.objects;
create policy "videos public read" on storage.objects
  for select using (bucket_id = 'videos');

drop policy if exists "videos anon insert" on storage.objects;
create policy "videos anon insert" on storage.objects
  for insert with check (bucket_id = 'videos');

drop policy if exists "videos anon delete" on storage.objects;
create policy "videos anon delete" on storage.objects
  for delete using (bucket_id = 'videos');
