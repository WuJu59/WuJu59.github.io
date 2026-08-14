-- ============================================================
-- 临时：管理页尚未接入账号系统前的宽松权限
-- 说明：目前管理页只用密码（js/config.js 的 adminPassword）登录，
--       因此暂时允许匿名请求修改/删除/新增数据。
--   ⚠️ 这意味着任何拿到 anon key 的人理论上都能改数据，
--      仅限开发阶段使用；账号系统做好后请恢复严格策略
--      （重新运行 schema.sql 即可）。
-- 用法：Supabase → SQL Editor → 粘贴 → Run（可重复运行）
-- ============================================================

drop policy if exists "guestbook anon manage temp" on public.guestbook;
create policy "guestbook anon manage temp" on public.guestbook
  for update using (true) with check (true);
drop policy if exists "guestbook anon delete temp" on public.guestbook;
create policy "guestbook anon delete temp" on public.guestbook for delete using (true);

drop policy if exists "asks anon manage temp" on public.asks;
create policy "asks anon manage temp" on public.asks
  for update using (true) with check (true);
drop policy if exists "asks anon delete temp" on public.asks;
create policy "asks anon delete temp" on public.asks for delete using (true);

drop policy if exists "shuoshuo anon insert temp" on public.shuoshuo;
create policy "shuoshuo anon insert temp" on public.shuoshuo for insert with check (true);
drop policy if exists "shuoshuo anon manage temp" on public.shuoshuo;
create policy "shuoshuo anon manage temp" on public.shuoshuo
  for update using (true) with check (true);
drop policy if exists "shuoshuo anon delete temp" on public.shuoshuo;
create policy "shuoshuo anon delete temp" on public.shuoshuo for delete using (true);

drop policy if exists "albums anon insert temp" on public.albums;
create policy "albums anon insert temp" on public.albums for insert with check (true);
drop policy if exists "albums anon manage temp" on public.albums;
create policy "albums anon manage temp" on public.albums
  for update using (true) with check (true);
drop policy if exists "albums anon delete temp" on public.albums;
create policy "albums anon delete temp" on public.albums for delete using (true);
