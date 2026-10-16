-- Pegar completo en Supabase > SQL Editor > Run
create table public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text, matricula text,
  subscription_status text not null default 'inactive',
  current_period_end timestamptz,
  mp_payment_id text,
  session_id text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "leer propio perfil" on public.profiles for select using (auth.uid()=id);
create policy "editar propio perfil" on public.profiles for update using (auth.uid()=id) with check (auth.uid()=id);
-- El médico solo puede modificar session_id. Estado de suscripción, nombre y matrícula: solo el servidor.
revoke update on public.profiles from anon, authenticated;
grant update(session_id) on public.profiles to authenticated;
create function public.nuevo_perfil() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,nombre,matricula) values(new.id,new.raw_user_meta_data->>'nombre',new.raw_user_meta_data->>'matricula');
  return new;
end $$;
create trigger al_crear_usuario after insert on auth.users for each row execute function public.nuevo_perfil();
