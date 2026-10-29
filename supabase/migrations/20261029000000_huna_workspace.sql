-- Huna for Huna workspace: port of the Cloudflare D1 schema and the
-- permission logic that lived in app/api/workspace/route.ts.
--
-- Tables have RLS enabled with no policies, so they can't be read or written
-- directly through the API. All access goes through the SECURITY DEFINER
-- functions below, which check the signed-in user's membership and role.

create table if not exists public.members (
  email text primary key,
  user_id uuid unique,
  role text not null check (role in ('Owner','Manager','Accountant','Tenant')),
  permissions jsonb not null default '[]'::jsonb,
  tenant text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.records (
  id text primary key,
  kind text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists records_kind_idx on public.records (kind);
create index if not exists records_email_idx on public.records ((lower(data->>'email')));

alter table public.members enable row level security;
alter table public.records enable row level security;
revoke all on public.members, public.records from anon, authenticated;

-- ---------------------------------------------------------------- helpers

create or replace function public.huna_member_or_null()
returns public.members
language plpgsql security definer set search_path = public
as $$
declare
  e text := lower(auth.jwt()->>'email');
  u uuid := auth.uid();
  m public.members;
begin
  if u is null or e is null then return null; end if;
  select * into m from public.members where user_id = u;
  if found then return m; end if;
  -- First sign-in for an invited email: link the account to the invitation.
  update public.members set user_id = u
   where email = e and user_id is null
  returning * into m;
  if found then return m; end if;
  return null;
end $$;

create or replace function public.huna_member()
returns public.members
language plpgsql security definer set search_path = public
as $$
declare m public.members;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  m := public.huna_member_or_null();
  if m.email is null then
    raise exception 'Access denied: ask your landlord to add your account';
  end if;
  return m;
end $$;

create or replace function public.huna_can(m public.members, perm text)
returns boolean language sql immutable as $$
  select m.role = 'Owner' or m.permissions ? perm
$$;

create or replace function public.huna_allow(m public.members, perm text)
returns void language plpgsql immutable as $$
begin
  if not public.huna_can(m, perm) then raise exception 'Permission denied'; end if;
end $$;

-- Parse a number from text; null when it isn't a finite number.
create or replace function public.huna_num(v text)
returns numeric language sql immutable as $$
  select case when v ~ '^\s*-?\d+(\.\d+)?\s*$' then v::numeric end
$$;

create or replace function public.huna_save(k text, d jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.records (id, kind, data) values (d->>'id', k, d)
  on conflict (id) do update set data = excluded.data, kind = excluded.kind
$$;

create or replace function public.huna_default_permissions(r text)
returns jsonb language sql immutable as $$
  select case r
    when 'Owner' then '["finance","maintenance","documents","messages","team"]'::jsonb
    when 'Manager' then '["maintenance","documents","messages"]'::jsonb
    when 'Accountant' then '["finance","documents"]'::jsonb
    else '["messages"]'::jsonb
  end
$$;

-- ---------------------------------------------------------------- reads

create or replace function public.huna_workspace()
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  m public.members := public.huna_member();
  d jsonb;
  people jsonb := '[]'::jsonb;
begin
  if m.role = 'Tenant' then
    select coalesce(jsonb_agg(r.data || jsonb_build_object('kind', r.kind) order by r.created_at), '[]')
      into d from public.records r
     where lower(r.data->>'email') = m.email
       and r.kind <> 'audit';
  else
    select coalesce(jsonb_agg(r.data || jsonb_build_object('kind', r.kind) order by r.created_at), '[]')
      into d from public.records r
     where not (r.kind in ('payment','expense','receipt','notification') and not public.huna_can(m, 'finance'))
       and not (r.kind = 'document' and not public.huna_can(m, 'documents'))
       and not (r.kind = 'audit' and m.role <> 'Owner')
       and not (r.kind = 'message' and not public.huna_can(m, 'messages'));
  end if;

  if m.role = 'Owner' then
    select coalesce(jsonb_agg(to_jsonb(x) - 'created_at' order by x.created_at), '[]')
      into people from public.members x;
  end if;

  return jsonb_build_object('data', d, 'member', to_jsonb(m) - 'created_at', 'members', people);
end $$;

-- Returns a document record if the caller may download it.
create or replace function public.huna_document(doc_id text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  m public.members := public.huna_member();
  d jsonb;
begin
  select data into d from public.records where id = doc_id and kind = 'document';
  if d is null then raise exception 'Not found'; end if;
  if m.role = 'Tenant' then
    if lower(d->>'email') <> m.email then raise exception 'Permission denied'; end if;
  else
    perform public.huna_allow(m, 'documents');
  end if;
  return d;
end $$;

-- ---------------------------------------------------------------- writes

create or replace function public.huna_action(action text, payload jsonb default '{}'::jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  m public.members := public.huna_member();
  p jsonb := coalesce(payload, '{}'::jsonb);
  me text := lower(auth.jwt()->>'email');
  my_name text := coalesce(nullif(auth.jwt()->'user_metadata'->>'full_name', ''), auth.jwt()->>'email');
  today text := to_char(now() at time zone 'Africa/Nairobi', 'YYYY-MM-DD');
  r jsonb;
  amt numeric;
  perms jsonb;
  existing text;
  rid text;
begin
  if action = 'seed' then
    if m.role <> 'Owner' then raise exception 'Permission denied'; end if;
    if exists (select 1 from public.records) then raise exception 'Workspace already contains records'; end if;
    insert into public.records (id, kind, data)
    select x->>'id', x->>'kind', x->'data'
      from jsonb_array_elements(coalesce(p->'records', '[]'::jsonb)) x
    on conflict (id) do nothing;

  elsif action = 'member' then
    if m.role <> 'Owner' then raise exception 'Permission denied'; end if;
    if coalesce(p->>'email', '') !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
       or coalesce(p->>'role', '') not in ('Manager','Accountant','Tenant') then
      raise exception 'Valid email and role required';
    end if;
    select role into existing from public.members where email = lower(p->>'email');
    if existing = 'Owner' then raise exception 'Owner cannot be changed'; end if;
    if p->>'role' = 'Tenant' then
      perms := public.huna_default_permissions('Tenant');
    else
      select coalesce(jsonb_agg(v), '[]') into perms
        from jsonb_array_elements_text(
          case when jsonb_typeof(p->'permissions') = 'array' then p->'permissions'
               else public.huna_default_permissions(p->>'role') end) v
       where v in ('finance','maintenance','documents','messages');
    end if;
    insert into public.members (email, role, permissions, tenant)
    values (lower(p->>'email'), p->>'role', perms, coalesce(p->>'unit', ''))
    on conflict (email) do update
      set role = excluded.role, permissions = excluded.permissions, tenant = excluded.tenant;

  elsif action = 'request' then
    if m.role <> 'Tenant' then perform public.huna_allow(m, 'maintenance'); end if;
    if trim(coalesce(p->>'title', '')) = '' or trim(coalesce(p->>'description', '')) = '' then
      raise exception 'Title and description required';
    end if;
    perform public.huna_save('request', jsonb_build_object(
      'id', gen_random_uuid()::text,
      'title', left(p->>'title', 150),
      'description', left(p->>'description', 3000),
      'property', coalesce(p->>'property', ''),
      'unit', case when m.role = 'Tenant' then m.tenant else coalesce(p->>'unit', '') end,
      'email', me,
      'name', my_name,
      'priority', case when p->>'priority' in ('Low','Medium','High') then p->>'priority' else 'Medium' end,
      'status', 'Open',
      'date', today));

  elsif action = 'status' then
    perform public.huna_allow(m, 'maintenance');
    select data into r from public.records where id = p->>'id' and kind = 'request';
    if r is null or coalesce(p->>'status', '') not in ('Open','In progress','Resolved') then
      raise exception 'Invalid request';
    end if;
    perform public.huna_save('request', r || jsonb_build_object('status', p->>'status'));

  elsif action = 'payment' then
    perform public.huna_allow(m, 'finance');
    select data into r from public.records where id = p->>'id' and kind = 'payment' for update;
    amt := public.huna_num(p->>'amount');
    if r is null or amt is null or amt <= 0
       or amt > (r->>'amount')::numeric - (r->>'paid')::numeric then
      raise exception 'Enter an amount within the outstanding balance';
    end if;
    if coalesce(p->>'date', '') !~ '^\d{4}-\d{2}-\d{2}$' or trim(coalesce(p->>'reference', '')) = '' then
      raise exception 'Date and reference are required';
    end if;
    perform public.huna_save('payment', r || jsonb_build_object(
      'paid', (r->>'paid')::numeric + amt,
      'method', p->>'method', 'reference', p->>'reference', 'date', p->>'date'));
    perform public.huna_save('receipt', jsonb_build_object(
      'id', gen_random_uuid()::text, 'payment', r->>'id', 'email', r->>'email',
      'amount', amt, 'method', p->>'method', 'reference', p->>'reference', 'date', p->>'date'));

  elsif action = 'property' then
    perform public.huna_allow(m, 'maintenance');
    if trim(coalesce(p->>'name', '')) = '' or trim(coalesce(p->>'area', '')) = ''
       or coalesce(public.huna_num(p->>'units'), 0) < 1 then
      raise exception 'Enter property details';
    end if;
    perform public.huna_save('property', jsonb_build_object(
      'id', gen_random_uuid()::text, 'name', p->>'name', 'area', p->>'area',
      'units', public.huna_num(p->>'units'), 'occupied', 0,
      'rent', coalesce(public.huna_num(p->>'rent'), 0), 'image', '/residence.jpg'));

  elsif action = 'tenancy' then
    perform public.huna_allow(m, 'finance');
    if trim(coalesce(p->>'name', '')) = '' or trim(coalesce(p->>'email', '')) = ''
       or trim(coalesce(p->>'unit', '')) = '' or coalesce(public.huna_num(p->>'amount'), 0) <= 0 then
      raise exception 'Complete all tenant fields';
    end if;
    perform public.huna_save('payment', jsonb_build_object(
      'id', gen_random_uuid()::text, 'name', p->>'name', 'email', lower(p->>'email'),
      'unit', p->>'unit', 'property', p->>'property', 'amount', public.huna_num(p->>'amount'),
      'paid', 0, 'date', p->>'date', 'method', '—', 'reference', ''));

  elsif action = 'expense' then
    perform public.huna_allow(m, 'finance');
    if trim(coalesce(p->>'title', '')) = '' or coalesce(public.huna_num(p->>'amount'), 0) <= 0 then
      raise exception 'Valid description and amount required';
    end if;
    perform public.huna_save('expense', jsonb_build_object(
      'id', gen_random_uuid()::text, 'title', p->>'title',
      'amount', public.huna_num(p->>'amount'), 'date', p->>'date', 'property', p->>'property'));

  elsif action = 'message' then
    perform public.huna_allow(m, 'messages');
    if trim(coalesce(p->>'text', '')) = '' then raise exception 'Message cannot be empty'; end if;
    perform public.huna_save('message', jsonb_build_object(
      'id', gen_random_uuid()::text, 'text', left(p->>'text', 3000),
      'email', case when m.role = 'Tenant' then me else lower(coalesce(p->>'email', '')) end,
      'sender', my_name, 'date', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')));

  elsif action = 'reminders' then
    perform public.huna_allow(m, 'finance');
    for r in select data from public.records
              where kind = 'payment' and (data->>'paid')::numeric < (data->>'amount')::numeric loop
      perform public.huna_save('notification', jsonb_build_object(
        'id', 'reminder-' || (r->>'id'), 'email', r->>'email',
        'title', 'Rent balance reminder',
        'text', 'KES ' || to_char((r->>'amount')::numeric - (r->>'paid')::numeric, 'FM999,999,999,990')
                || ' remains outstanding for ' || (r->>'unit') || '.',
        'date', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')));
    end loop;

  elsif action = 'document' then
    -- Called after the file has been uploaded to the private `documents` bucket.
    perform public.huna_allow(m, 'documents');
    rid := p->>'id';
    if rid is null or not exists (
      select 1 from storage.objects where bucket_id = 'documents' and name = rid) then
      raise exception 'Upload not found';
    end if;
    perform public.huna_save('document', jsonb_build_object(
      'id', rid, 'name', left(coalesce(p->>'name', 'document'), 200),
      'size', coalesce(public.huna_num(p->>'size'), 0),
      'email', lower(coalesce(p->>'email', '')),
      'date', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'uploadedBy', me));

  else
    raise exception 'Unknown action';
  end if;

  perform public.huna_save('audit', jsonb_build_object(
    'id', gen_random_uuid()::text, 'action', action, 'by', me,
    'date', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')));
  return jsonb_build_object('ok', true);
end $$;

-- Only signed-in users may call the API functions; helpers stay internal.
revoke execute on all functions in schema public from public, anon;
grant execute on function public.huna_workspace(), public.huna_document(text),
  public.huna_action(text, jsonb) to authenticated;

-- ---------------------------------------------------------------- storage

insert into storage.buckets (id, name, public, file_size_limit)
values ('documents', 'documents', false, 10485760)
on conflict (id) do nothing;

create or replace function public.huna_storage_can_upload()
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare m public.members := public.huna_member_or_null();
begin
  return m.email is not null and public.huna_can(m, 'documents');
end $$;

create or replace function public.huna_storage_can_read(object_name text)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare
  m public.members := public.huna_member_or_null();
  d jsonb;
begin
  if m.email is null then return false; end if;
  select data into d from public.records where id = object_name and kind = 'document';
  if d is null then return false; end if;
  if m.role = 'Tenant' then return lower(d->>'email') = m.email; end if;
  return public.huna_can(m, 'documents');
end $$;

grant execute on function public.huna_storage_can_upload(), public.huna_storage_can_read(text) to authenticated;

drop policy if exists "huna documents upload" on storage.objects;
create policy "huna documents upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and public.huna_storage_can_upload());

drop policy if exists "huna documents read" on storage.objects;
create policy "huna documents read" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and (public.huna_storage_can_read(name) or public.huna_storage_can_upload()));

drop policy if exists "huna documents delete" on storage.objects;
create policy "huna documents delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and public.huna_storage_can_upload());
