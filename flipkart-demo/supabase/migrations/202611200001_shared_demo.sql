create table public.demo_entities (
  id text primary key,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
create table public.demo_messages (
  id uuid primary key default gen_random_uuid(),
  order_id text not null,
  sender text not null check (sender in ('customer','driver')),
  body text not null default '' check (length(body) <= 2000),
  attachment_name text,
  attachment_path text,
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id),
  check (length(trim(body)) > 0 or attachment_path is not null)
);
create index demo_messages_order_created on public.demo_messages(order_id,created_at);
alter table public.demo_entities enable row level security;
alter table public.demo_messages enable row level security;
-- Shared LOCAL demo workspace: anonymous sign-ins are authenticated sessions.
create policy entities_read on public.demo_entities for select to authenticated using (true);
create policy entities_update on public.demo_entities for update to authenticated using (true) with check (true);
create policy messages_read on public.demo_messages for select to authenticated using (true);
create policy messages_insert on public.demo_messages for insert to authenticated with check (user_id = auth.uid());
grant select,update on public.demo_entities to authenticated;
grant select,insert on public.demo_messages to authenticated;
revoke all on public.demo_entities,public.demo_messages from anon;

-- One transaction for cross-record changes; merge fields instead of replacing rows.
create or replace function public.apply_demo_changes(p_changes jsonb)
returns setof public.demo_entities language plpgsql security invoker set search_path = '' as $$
declare change jsonb; result public.demo_entities;
begin
  if auth.uid() is null then raise exception 'Sign in is required'; end if;
  if jsonb_typeof(p_changes) <> 'array' or jsonb_array_length(p_changes) > 20 then raise exception 'Invalid changes'; end if;
  for change in select value from jsonb_array_elements(p_changes) order by value->>'id' loop
    if jsonb_typeof(change->'patch') <> 'object' or octet_length((change->'patch')::text) > 65536 then raise exception 'Invalid patch'; end if;
    update public.demo_entities
    set data = data || (change->'patch'), revision = revision + 1, updated_at = now()
    where id = change->>'id' returning * into result;
    if not found then raise exception 'Unknown demo record'; end if;
    return next result;
  end loop;
end $$;
revoke all on function public.apply_demo_changes(jsonb) from public;
grant execute on function public.apply_demo_changes(jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('demo-attachments','demo-attachments',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf','video/mp4'])
on conflict (id) do nothing;
create policy attachments_read on storage.objects for select to authenticated using (bucket_id = 'demo-attachments');
create policy attachments_insert on storage.objects for insert to authenticated with check (bucket_id = 'demo-attachments' and (storage.foldername(name))[1] = (select auth.uid()::text));

alter publication supabase_realtime add table public.demo_entities;
alter publication supabase_realtime add table public.demo_messages;
