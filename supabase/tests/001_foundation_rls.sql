begin;
select plan(9);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'user_roles', 'user_roles table exists');
select has_table('public', 'member_status', 'member_status table exists');

select row_security_active('public', 'profiles', 'profiles RLS is enabled');
select row_security_active('public', 'user_roles', 'user_roles RLS is enabled');
select row_security_active('public', 'member_status', 'member_status RLS is enabled');

select policies_are(
  'public',
  'profiles',
  array['Members can read their own profile', 'Members can update their own profile'],
  'profiles exposes only ownership policies'
);

select policies_are(
  'public',
  'user_roles',
  array['Members can read their own active role'],
  'user_roles exposes only own active role'
);

select policies_are(
  'public',
  'member_status',
  array['Members can read their own status'],
  'member status exposes only own row'
);

select * from finish();
rollback;
