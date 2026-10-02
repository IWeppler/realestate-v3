create table if not exists public.property_nearby_places (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  category text not null check (category in (
    'shopping', 'park', 'school', 'university', 'hospital', 'pharmacy',
    'supermarket', 'transport', 'parking', 'restaurant', 'gym', 'other'
  )),
  name text not null check (char_length(name) between 2 and 120),
  distance_m integer check (distance_m is null or distance_m between 0 and 50000),
  created_at timestamptz not null default now()
);

create index if not exists property_nearby_places_property_idx
  on public.property_nearby_places(property_id);

alter table public.property_nearby_places enable row level security;

create policy "Lectura pública de lugares cercanos"
  on public.property_nearby_places for select using (true);

create policy "Agente o admin gestiona lugares cercanos"
  on public.property_nearby_places for all to authenticated
  using (
    exists (select 1 from public.properties p where p.id = property_id and p.agent_id = auth.uid())
    or (select a.role from public.agents a where a.id = auth.uid()) = 'admin'
  )
  with check (
    exists (select 1 from public.properties p where p.id = property_id and p.agent_id = auth.uid())
    or (select a.role from public.agents a where a.id = auth.uid()) = 'admin'
  );
