-- ============================================================
-- WuJu59Web 数据库（Supabase）
-- 用法：Supabase 项目 → SQL Editor → 新建查询 → 粘贴运行
-- ============================================================

create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(),
  nick text not null default '匿名访客',
  text text not null,
  doodle text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.asks (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null default '',
  answer_image text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.shuoshuo (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  mood text not null default '日常',
  likes integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  note text not null default '',
  url text not null default '',
  emoji text not null default '✿',
  color text not null default '#f5b06e',
  created_at timestamptz not null default now()
);

alter table public.guestbook enable row level security;
alter table public.asks enable row level security;
alter table public.shuoshuo enable row level security;
alter table public.albums enable row level security;

-- 留言板：人人可读、可留言；只有登录管理员可改/删
create policy "guestbook select" on public.guestbook for select using (true);
create policy "guestbook insert" on public.guestbook for insert with check (true);
create policy "guestbook update" on public.guestbook for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "guestbook delete" on public.guestbook for delete using (auth.role() = 'authenticated');

-- 提问箱：人人可读、可提问；只有登录管理员可回答/删除
create policy "asks select" on public.asks for select using (true);
create policy "asks insert" on public.asks for insert with check (true);
create policy "asks update" on public.asks for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "asks delete" on public.asks for delete using (auth.role() = 'authenticated');

-- 说说：人人可读；只有管理员可增删改
create policy "shuoshuo select" on public.shuoshuo for select using (true);
create policy "shuoshuo insert" on public.shuoshuo for insert with check (auth.role() = 'authenticated');
create policy "shuoshuo update" on public.shuoshuo for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "shuoshuo delete" on public.shuoshuo for delete using (auth.role() = 'authenticated');

-- 相册：人人可读；只有管理员可增删改
create policy "albums select" on public.albums for select using (true);
create policy "albums insert" on public.albums for insert with check (auth.role() = 'authenticated');
create policy "albums update" on public.albums for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "albums delete" on public.albums for delete using (auth.role() = 'authenticated');

-- 点赞：公开函数，只允许把 likes +1（不能改其它内容）
create or replace function public.increment_like(row_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.shuoshuo set likes = likes + 1 where id = row_id;
$$;

grant execute on function public.increment_like(uuid) to anon, authenticated;

-- 回答图片存储桶（公开）
insert into storage.buckets (id, name, public)
values ('answer-images', 'answer-images', true)
on conflict (id) do nothing;

drop policy if exists "answer-images public read" on storage.objects;
create policy "answer-images public read" on storage.objects
  for select using (bucket_id = 'answer-images');

drop policy if exists "answer-images anon insert" on storage.objects;
create policy "answer-images anon insert" on storage.objects
  for insert with check (bucket_id = 'answer-images');

drop policy if exists "answer-images anon delete" on storage.objects;
create policy "answer-images anon delete" on storage.objects
  for delete using (bucket_id = 'answer-images');

-- ============================================================
-- 示例数据（可删掉换成你自己的）
-- ============================================================
insert into public.shuoshuo (text, mood, likes, created_at) values
('小站 v0.5 更新完成！新增星星背景和可爱装饰 ✿', '开心', 12, '2026-08-12 10:00:00+00'),
('首页中间放了个神秘方框，以后那里会藏一个彩蛋，先不剧透。', '神秘', 8, '2026-08-12 09:00:00+00'),
('最近迷上复古与千禧年美学，但想做个安静一点的版本，现在是现代复古结合风。', '思考', 15, '2026-08-11 12:00:00+00'),
('2026 年愿望清单：学会写网页、每周写点东西、去一次海边。', '奋斗', 9, '2026-08-10 12:00:00+00'),
('提问箱上线了，匿名提问，认真回答。来问我吧！', '欢迎', 20, '2026-08-08 12:00:00+00');

insert into public.albums (title, note, emoji, color, url, created_at) values
('千禧小站开张', '照片占位', '🎉', '#f6d7a7', '', '2026-08-12 10:00:00+00'),
('海边计划', '照片占位', '🌊', '#b7e3f5', '', '2026-08-10 10:00:00+00'),
('路边的小猫', '照片占位', '🐱', '#f3e2c9', '', '2026-08-06 10:00:00+00'),
('咖啡时间', '照片占位', '☕', '#e5d3b3', '', '2026-08-02 10:00:00+00');

insert into public.guestbook (nick, text, doodle, created_at) values
('站长', '欢迎来到小站！可以留言，也可以画个涂鸦 ✿', '', '2026-08-12 10:00:00+00');

insert into public.asks (question, answer, created_at) values
('你是怎么学会做网站的？', '用 vibe coding：我把想法说清楚，AI 帮我写代码，我再慢慢改。', '2026-08-12 10:00:00+00'),
('为什么叫 WuJu59Web？', '自己起的项目名，没有特别含义，顺口就好。', '2026-08-12 09:00:00+00');
