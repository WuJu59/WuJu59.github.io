-- ============================================================
-- v0.8 迁移：回答提问可附带图片
-- 现有数据库执行这一份即可（新装数据库直接跑 schema.sql）
-- ============================================================

-- 1) 提问箱加一列：回答图片 URL
alter table public.asks
  add column if not exists answer_image text not null default '';

-- 2) 创建公开存储桶 answer-images（放回答图片）
insert into storage.buckets (id, name, public)
values ('answer-images', 'answer-images', true)
on conflict (id) do nothing;

-- 3) 存储桶权限（临时宽松，与账号系统前的临时方案一致）
drop policy if exists "answer-images public read" on storage.objects;
create policy "answer-images public read" on storage.objects
  for select using (bucket_id = 'answer-images');

drop policy if exists "answer-images anon insert" on storage.objects;
create policy "answer-images anon insert" on storage.objects
  for insert with check (bucket_id = 'answer-images');

drop policy if exists "answer-images anon delete" on storage.objects;
create policy "answer-images anon delete" on storage.objects
  for delete using (bucket_id = 'answer-images');
