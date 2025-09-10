-- Criar tabelas para colaboradores no Supabase
-- Execute este script no SQL Editor do Supabase

-- Tabela de colaboradores
CREATE TABLE IF NOT EXISTS colaboradores (
    id SERIAL PRIMARY KEY,
    estabelecimento_id UUID REFERENCES estabelecimentos (id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    foto_url TEXT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Tabela de serviços (se ainda não existir)
CREATE TABLE IF NOT EXISTS servicos (
    id SERIAL PRIMARY KEY,
    estabelecimento_id UUID REFERENCES estabelecimentos (id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2),
    duracao INTEGER, -- em minutos
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento colaboradores_servicos (muitos para muitos)
CREATE TABLE IF NOT EXISTS colaboradores_servicos (
    id SERIAL PRIMARY KEY,
    colaborador_id INTEGER REFERENCES colaboradores (id) ON DELETE CASCADE,
    servico_id INTEGER REFERENCES servicos (id) ON DELETE CASCADE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        UNIQUE (colaborador_id, servico_id) -- Evita duplicatas
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_colaboradores_estabelecimento_id ON colaboradores (estabelecimento_id);

CREATE INDEX IF NOT EXISTS idx_servicos_estabelecimento_id ON servicos (estabelecimento_id);

CREATE INDEX IF NOT EXISTS idx_colaboradores_servicos_colaborador_id ON colaboradores_servicos (colaborador_id);

CREATE INDEX IF NOT EXISTS idx_colaboradores_servicos_servico_id ON colaboradores_servicos (servico_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;

ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

ALTER TABLE colaboradores_servicos ENABLE ROW LEVEL SECURITY;

-- Políticas para colaboradores
CREATE POLICY "Usuários podem ver colaboradores de seus estabelecimentos" ON colaboradores FOR
SELECT USING (
        estabelecimento_id IN (
            SELECT id
            FROM estabelecimentos
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Usuários podem inserir colaboradores em seus estabelecimentos" ON colaboradores FOR
INSERT
WITH
    CHECK (
        estabelecimento_id IN (
            SELECT id
            FROM estabelecimentos
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Usuários podem atualizar colaboradores de seus estabelecimentos" ON colaboradores FOR
UPDATE USING (
    estabelecimento_id IN (
        SELECT id
        FROM estabelecimentos
        WHERE
            user_id = auth.uid ()
    )
);

CREATE POLICY "Usuários podem deletar colaboradores de seus estabelecimentos" ON colaboradores FOR DELETE USING (
    estabelecimento_id IN (
        SELECT id
        FROM estabelecimentos
        WHERE
            user_id = auth.uid ()
    )
);

-- Políticas para serviços
CREATE POLICY "Usuários podem ver serviços de seus estabelecimentos" ON servicos FOR
SELECT USING (
        estabelecimento_id IN (
            SELECT id
            FROM estabelecimentos
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Usuários podem inserir serviços em seus estabelecimentos" ON servicos FOR
INSERT
WITH
    CHECK (
        estabelecimento_id IN (
            SELECT id
            FROM estabelecimentos
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Usuários podem atualizar serviços de seus estabelecimentos" ON servicos FOR
UPDATE USING (
    estabelecimento_id IN (
        SELECT id
        FROM estabelecimentos
        WHERE
            user_id = auth.uid ()
    )
);

CREATE POLICY "Usuários podem deletar serviços de seus estabelecimentos" ON servicos FOR DELETE USING (
    estabelecimento_id IN (
        SELECT id
        FROM estabelecimentos
        WHERE
            user_id = auth.uid ()
    )
);

-- Políticas para colaboradores_servicos
CREATE POLICY "Usuários podem ver vínculos de colaboradores-serviços de seus estabelecimentos" ON colaboradores_servicos FOR
SELECT USING (
        colaborador_id IN (
            SELECT c.id
            FROM
                colaboradores c
                JOIN estabelecimentos e ON c.estabelecimento_id = e.id
            WHERE
                e.user_id = auth.uid ()
        )
    );

CREATE POLICY "Usuários podem inserir vínculos de colaboradores-serviços de seus estabelecimentos" ON colaboradores_servicos FOR
INSERT
WITH
    CHECK (
        colaborador_id IN (
            SELECT c.id
            FROM
                colaboradores c
                JOIN estabelecimentos e ON c.estabelecimento_id = e.id
            WHERE
                e.user_id = auth.uid ()
        )
    );

CREATE POLICY "Usuários podem deletar vínculos de colaboradores-serviços de seus estabelecimentos" ON colaboradores_servicos FOR DELETE USING (
    colaborador_id IN (
        SELECT c.id
        FROM
            colaboradores c
            JOIN estabelecimentos e ON c.estabelecimento_id = e.id
        WHERE
            e.user_id = auth.uid ()
    )
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_colaboradores_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_servicos_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_colaboradores_updated_at BEFORE UPDATE ON colaboradores 
FOR EACH ROW EXECUTE PROCEDURE update_colaboradores_updated_at_column();

CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos 
FOR EACH ROW EXECUTE PROCEDURE update_servicos_updated_at_column();

-- Criar bucket para fotos dos colaboradores no Storage (execute no console do Supabase)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('colaboradores', 'colaboradores', true);