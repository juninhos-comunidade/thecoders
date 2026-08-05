create type nivel_expertise as enum ('ESTAGIARIO', 'JUNIOR');
create type nivel_dificuldade as enum ('FACIL', 'MEDIO', 'DIFICIL');

create table usuarios (
    id uuid primary key default gen_random_uuid(),
    nome_completo text not null,
    email text unique not null,
    senha_hash text not null,
    nivel_expertise nivel_expertise not null default 'ESTAGIARIO',
    xp integer not null default 0,
    nivel_dificuldade nivel_dificuldade not null default 'FACIL',
    status_login boolean not null default false,
    primeiro_login boolean not null default true,
    criado_em timestamptz not null default now()
);

create table cases (
    id uuid primary key default gen_random_uuid(),
    titulo text not null,
    descricao text not null,
    nivel_dificuldade nivel_dificuldade not null,
    tempo_minimo_busca interval,
    temporizador_aberto interval,
    criado_em timestamptz not null default now()
);

create table salas (
    id uuid primary key default gen_random_uuid(),
    case_id uuid references cases(id),
    nivel_expertise nivel_expertise not null,
    nivel_dificuldade nivel_dificuldade not null,
    numero_participantes integer not null default 0,
    criado_em timestamptz not null default now()
);

create table sala_participantes (
    sala_id uuid references salas(id) on delete cascade,
    usuario_id uuid references usuarios(id) on delete cascade,
    entrou_em timestamptz not null default now(),
    primary key (sala_id, usuario_id)
);

create table chat_mensagens (
    id uuid primary key default gen_random_uuid(),
    sala_id uuid references salas(id) on delete cascade,
    usuario_id uuid references usuarios(id) on delete cascade,
    mensagem text not null,
    enviado_em timestamptz not null default now()
);

create table resultados (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid references usuarios(id) on delete cascade,
    case_id uuid references cases(id) on delete cascade,
    sala_id uuid references salas(id) on delete cascade,
    solucao_enviada text,
    nivel_alcancado integer,
    feedback_simulado text,
    aprovado boolean,
    criado_em timestamptz not null default now()
);