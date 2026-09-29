-- Supabase security advisor: pin the search path of the two JWT helper functions.
create or replace function public.app_role() returns text
language sql stable set search_path = '' as $$ select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') $$;

create or replace function public.app_employee_id() returns integer
language sql stable set search_path = '' as $$ select nullif(auth.jwt() -> 'app_metadata' ->> 'employee_id', '')::integer $$;

comment on table public.claims_seed is 'Pristine copy of the 80 MOCK seed claims for reset_demo(). No API access by design.';
