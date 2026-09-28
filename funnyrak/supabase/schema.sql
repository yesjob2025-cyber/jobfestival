-- 하루 계획 · Supabase 'plans' 테이블 (참고용 복원본)
--
-- 앱·Apps Script 코드에서 거꾸로 짜 맞춘 것입니다. 실제 DB 와 다를 수 있으니
-- README '4. Supabase 설정 가져오기' 에 따라 실제 정의로 이 파일을 교체해 주세요.
-- (새 프로젝트로 옮기거나 복구할 때 쓰는 용도. 지금 운영 중인 DB 에 다시 실행할 필요는 없습니다)

create table if not exists public.plans (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.plans enable row level security;

-- 본인 행만 읽기 · 쓰기 (앱은 upsert, Apps Script 는 select · patch 를 씀)
create policy "plans_select_own" on public.plans for select using (auth.uid() = user_id);
create policy "plans_insert_own" on public.plans for insert with check (auth.uid() = user_id);
create policy "plans_update_own" on public.plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
