-- ============================================================
-- Borderless — friend referrals
-- Each member gets a unique invite code; new accounts can be linked to the
-- member who referred them. Bonus points pay out at check-in (see app code):
--   friend's 1st event → +5,  2nd → +10,  3rd → +15  (to the referrer).
-- Run once in the Supabase SQL Editor.
-- ============================================================

alter table public.members add column if not exists invite_code text;
alter table public.members add column if not exists referred_by uuid references public.members(id) on delete set null;

-- give existing members a code
update public.members
   set invite_code = upper(substr(md5(random()::text || id::text), 1, 6))
 where invite_code is null;

create unique index if not exists members_invite_code_key on public.members (invite_code);

-- allow the new "invite" ledger kind for referral bonuses
alter table public.points_ledger drop constraint if exists points_ledger_kind_check;
alter table public.points_ledger add constraint points_ledger_kind_check
  check (kind in ('participation', 'invite_fresh', 'invite_returning', 'invite', 'redemption'));

-- new-user trigger: generate a unique invite code and, if the signup carried a
-- friend code (ref_code), link this member to their referrer.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  code   text;
  ref    text;
  ref_id uuid;
begin
  loop
    code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from public.members where invite_code = code);
  end loop;

  ref := nullif(trim(new.raw_user_meta_data ->> 'ref_code'), '');
  if ref is not null then
    select id into ref_id from public.members where upper(invite_code) = upper(ref) limit 1;
  end if;

  insert into public.members (id, name, invite_code, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    code,
    ref_id
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
