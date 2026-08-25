begin;
select plan(14);

select has_table('public', 'products', 'products table exists');
select has_table('public', 'product_variants', 'variants table exists');
select has_table('public', 'inventory_items', 'inventory table exists');
select has_table('public', 'orders', 'orders table exists');
select has_table('public', 'payments', 'payments table exists');
select has_table('public', 'promotions', 'promotions table exists');
select has_table('public', 'audit_logs', 'audit table exists');

select row_security_active('public', 'products', 'products RLS is enabled');
select row_security_active('public', 'orders', 'orders RLS is enabled');
select row_security_active('public', 'payments', 'payments RLS is enabled');
select row_security_active('public', 'inventory_items', 'inventory RLS is enabled');

select policies_are(
  'public', 'products', array['Public can read published products'],
  'products expose only published catalogue rows'
);
select policies_are(
  'public', 'orders', array['Members read own orders'],
  'orders expose only member ownership reads'
);
select policies_are(
  'public', 'payment_events', array[]::text[],
  'payment events have no client policy'
);

select * from finish();
rollback;
