alter table public.profiles
add column if not exists email text;

update public.profiles p
set email = lower(u.email)
from auth.users u
where u.id = p.id
  and p.email is distinct from lower(u.email);

create index if not exists profiles_email_idx
on public.profiles (lower(email))
where email is not null;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, lower(new.email));
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  insert into public.member_status (user_id, status) values (new.id, 'active');
  return new;
end;
$$;

create or replace function private.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = lower(new.email), updated_at = now()
  where id = new.id;
  return new;
end;
$$;

revoke all on function private.sync_profile_email() from public, anon, authenticated;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
when (old.email is distinct from new.email)
execute function private.sync_profile_email();

grant select on table public.profiles, public.user_roles,
  public.member_status to authenticated;

drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
on public.profiles for select to authenticated
using ((select private.is_admin()));

drop policy if exists "Admins read all roles" on public.user_roles;
create policy "Admins read all roles"
on public.user_roles for select to authenticated
using ((select private.is_admin()));

drop policy if exists "Admins read all member statuses" on public.member_status;
create policy "Admins read all member statuses"
on public.member_status for select to authenticated
using ((select private.is_admin()));

drop function if exists public.admin_members();
