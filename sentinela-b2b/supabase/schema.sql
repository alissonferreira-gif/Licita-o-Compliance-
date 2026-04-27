-- SENTINELA B2B — Schema Supabase
-- Execute no SQL Editor do projeto Supabase

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- COMPANIES
-- ─────────────────────────────────────────────────────────────
create table public.companies (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  razao_social      text not null,
  cnpj              text unique not null,
  regime_tributario text default 'lucro_real'
    check (regime_tributario in ('lucro_real','lucro_presumido','simples')),
  plan              text default 'free'
    check (plan in ('free','pro','enterprise')),
  gemini_api_key    text,
  created_at        timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- FISCAL ANALYSES (NFe XML → PIS/COFINS recovery)
-- ─────────────────────────────────────────────────────────────
create table public.fiscal_analyses (
  id                        uuid primary key default uuid_generate_v4(),
  company_id                uuid references public.companies(id) on delete cascade,
  created_at                timestamptz default now(),

  filename                  text not null,
  file_hash                 text not null,
  nfe_count                 int default 1,

  cnpj_emitente             text,
  numero_nfe                text,
  chave_acesso              text,
  data_emissao              date,
  total_nfe                 numeric(15,2) default 0,
  total_recuperavel_pis     numeric(15,2) default 0,
  total_recuperavel_cofins  numeric(15,2) default 0,
  total_recuperavel         numeric(15,2) default 0,
  itens_monofasicos         int default 0,
  total_itens               int default 0,
  status                    text default 'OK',

  itens_json                jsonb,

  report_unlocked           boolean default false,
  report_pdf_url            text
);

-- ─────────────────────────────────────────────────────────────
-- LICITACAO ANALYSES (Edital PDF → AI analysis)
-- ─────────────────────────────────────────────────────────────
create table public.licitacao_analyses (
  id                  uuid primary key default uuid_generate_v4(),
  company_id          uuid references public.companies(id) on delete cascade,
  created_at          timestamptz default now(),

  filename            text not null,
  objeto              text,
  modalidade          text,
  orgao               text,
  numero_edital       text,
  valor_estimado      numeric(15,2),
  data_abertura       date,

  risk_level          text check (risk_level in ('low','medium','high','critical')),
  risk_score          int,
  oportunidade_score  int,
  clauses             jsonb default '[]',
  objections          jsonb default '[]',
  pontos_favoraveis   jsonb default '[]',
  recomendacoes       jsonb default '[]',
  resumo_executivo    text,

  raw_ai_response     jsonb,

  report_unlocked     boolean default false,
  report_pdf_url      text
);

-- ─────────────────────────────────────────────────────────────
-- BANKING ANALYSES
-- ─────────────────────────────────────────────────────────────
create table public.banking_analyses (
  id                  uuid primary key default uuid_generate_v4(),
  company_id          uuid references public.companies(id) on delete cascade,
  created_at          timestamptz default now(),

  filename            text not null,
  banco               text,
  agencia             text,
  periodo_inicio      date,
  periodo_fim         date,
  total_tarifas       numeric(15,2) default 0,
  total_recuperavel   numeric(15,2) default 0,
  irregularidades     jsonb default '[]',
  recomendacoes       jsonb default '[]',
  resumo              text,

  raw_ai_response     jsonb,

  report_unlocked     boolean default false,
  report_pdf_url      text
);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
alter table public.companies          enable row level security;
alter table public.fiscal_analyses    enable row level security;
alter table public.licitacao_analyses enable row level security;
alter table public.banking_analyses   enable row level security;

create policy "own_company" on public.companies
  for all using (user_id = auth.uid());

create policy "own_fiscal" on public.fiscal_analyses
  for all using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

create policy "own_licitacao" on public.licitacao_analyses
  for all using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

create policy "own_banking" on public.banking_analyses
  for all using (
    company_id in (select id from public.companies where user_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
create index on public.fiscal_analyses    (company_id, created_at desc);
create index on public.licitacao_analyses (company_id, created_at desc);
create index on public.banking_analyses   (company_id, created_at desc);
create index on public.fiscal_analyses    (file_hash);
create index on public.licitacao_analyses (risk_level);
