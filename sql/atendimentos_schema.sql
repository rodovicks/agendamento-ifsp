-- Schema completo para sistema de atendimentos
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela principal de atendimentos
CREATE TABLE IF NOT EXISTS atendimentos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    estabelecimento_id uuid NOT NULL,
    agendamento_id uuid NULL, -- Referência ao agendamento original (pode ser null para atendimentos diretos)
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_telefone VARCHAR(20),
    cliente_email VARCHAR(255),
    data_atendimento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME,
    status VARCHAR(50) DEFAULT 'agendado' CHECK (status IN ('agendado', 'em_andamento', 'finalizado', 'cancelado')),
    observacoes TEXT,
    valor_total DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de junção: atendimentos <-> serviços (many-to-many)
CREATE TABLE IF NOT EXISTS atendimentos_servicos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    atendimento_id uuid NOT NULL,
    servico_id uuid NOT NULL,
    preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de junção: atendimentos <-> colaboradores (many-to-many)
CREATE TABLE IF NOT EXISTS atendimentos_colaboradores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    atendimento_id uuid NOT NULL,
    colaborador_id integer NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar as foreign keys quando as tabelas referenciadas existirem
DO $$
BEGIN
    -- FK para estabelecimentos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'estabelecimentos') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'atendimentos_estabelecimento_id_fkey'
            AND table_name = 'atendimentos'
        ) THEN
            ALTER TABLE atendimentos 
            ADD CONSTRAINT atendimentos_estabelecimento_id_fkey 
            FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- FK para agendamentos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agendamentos') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'atendimentos_agendamento_id_fkey'
            AND table_name = 'atendimentos'
        ) THEN
            ALTER TABLE atendimentos 
            ADD CONSTRAINT atendimentos_agendamento_id_fkey 
            FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL;
        END IF;
    END IF;

    -- FK para atendimentos_servicos
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'atendimentos_servicos_atendimento_id_fkey'
        AND table_name = 'atendimentos_servicos'
    ) THEN
        ALTER TABLE atendimentos_servicos 
        ADD CONSTRAINT atendimentos_servicos_atendimento_id_fkey 
        FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id) ON DELETE CASCADE;
    END IF;

    -- FK para servicos (assumindo que servicos tem id como uuid)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'servicos') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'atendimentos_servicos_servico_id_fkey'
            AND table_name = 'atendimentos_servicos'
        ) THEN
            ALTER TABLE atendimentos_servicos 
            ADD CONSTRAINT atendimentos_servicos_servico_id_fkey 
            FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- FK para atendimentos_colaboradores
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'atendimentos_colaboradores_atendimento_id_fkey'
        AND table_name = 'atendimentos_colaboradores'
    ) THEN
        ALTER TABLE atendimentos_colaboradores 
        ADD CONSTRAINT atendimentos_colaboradores_atendimento_id_fkey 
        FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id) ON DELETE CASCADE;
    END IF;

    -- FK para colaboradores
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'colaboradores') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'atendimentos_colaboradores_colaborador_id_fkey'
            AND table_name = 'atendimentos_colaboradores'
        ) THEN
            ALTER TABLE atendimentos_colaboradores 
            ADD CONSTRAINT atendimentos_colaboradores_colaborador_id_fkey 
            FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_atendimentos_estabelecimento_id ON atendimentos (estabelecimento_id);

CREATE INDEX IF NOT EXISTS idx_atendimentos_data ON atendimentos (data_atendimento);

CREATE INDEX IF NOT EXISTS idx_atendimentos_status ON atendimentos (status);

CREATE INDEX IF NOT EXISTS idx_atendimentos_agendamento_id ON atendimentos (agendamento_id);

CREATE INDEX IF NOT EXISTS idx_atendimentos_servicos_atendimento_id ON atendimentos_servicos (atendimento_id);

CREATE INDEX IF NOT EXISTS idx_atendimentos_servicos_servico_id ON atendimentos_servicos (servico_id);

CREATE INDEX IF NOT EXISTS idx_atendimentos_colaboradores_atendimento_id ON atendimentos_colaboradores (atendimento_id);

CREATE INDEX IF NOT EXISTS idx_atendimentos_colaboradores_colaborador_id ON atendimentos_colaboradores (colaborador_id);

-- Evitar duplicatas na tabela de junção atendimentos_servicos
CREATE UNIQUE INDEX IF NOT EXISTS idx_atendimentos_servicos_unique ON atendimentos_servicos (atendimento_id, servico_id);

-- Evitar duplicatas na tabela de junção atendimentos_colaboradores
CREATE UNIQUE INDEX IF NOT EXISTS idx_atendimentos_colaboradores_unique ON atendimentos_colaboradores (
    atendimento_id,
    colaborador_id
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE atendimentos ENABLE ROW LEVEL SECURITY;

ALTER TABLE atendimentos_servicos ENABLE ROW LEVEL SECURITY;

ALTER TABLE atendimentos_colaboradores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para atendimentos
CREATE POLICY "Usuários podem ver atendimentos de seus estabelecimentos" ON atendimentos FOR
SELECT USING (
        estabelecimento_id IN (
            SELECT id
            FROM estabelecimentos
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Usuários podem inserir atendimentos em seus estabelecimentos" ON atendimentos FOR
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

CREATE POLICY "Usuários podem atualizar atendimentos de seus estabelecimentos" ON atendimentos FOR
UPDATE USING (
    estabelecimento_id IN (
        SELECT id
        FROM estabelecimentos
        WHERE
            user_id = auth.uid ()
    )
);

CREATE POLICY "Usuários podem deletar atendimentos de seus estabelecimentos" ON atendimentos FOR DELETE USING (
    estabelecimento_id IN (
        SELECT id
        FROM estabelecimentos
        WHERE
            user_id = auth.uid ()
    )
);

-- Políticas RLS para atendimentos_servicos
CREATE POLICY "Usuários podem ver serviços de seus atendimentos" ON atendimentos_servicos FOR
SELECT USING (
        atendimento_id IN (
            SELECT id
            FROM atendimentos
            WHERE
                estabelecimento_id IN (
                    SELECT id
                    FROM estabelecimentos
                    WHERE
                        user_id = auth.uid ()
                )
        )
    );

CREATE POLICY "Usuários podem inserir serviços em seus atendimentos" ON atendimentos_servicos FOR
INSERT
WITH
    CHECK (
        atendimento_id IN (
            SELECT id
            FROM atendimentos
            WHERE
                estabelecimento_id IN (
                    SELECT id
                    FROM estabelecimentos
                    WHERE
                        user_id = auth.uid ()
                )
        )
    );

CREATE POLICY "Usuários podem atualizar serviços de seus atendimentos" ON atendimentos_servicos FOR
UPDATE USING (
    atendimento_id IN (
        SELECT id
        FROM atendimentos
        WHERE
            estabelecimento_id IN (
                SELECT id
                FROM estabelecimentos
                WHERE
                    user_id = auth.uid ()
            )
    )
);

CREATE POLICY "Usuários podem deletar serviços de seus atendimentos" ON atendimentos_servicos FOR DELETE USING (
    atendimento_id IN (
        SELECT id
        FROM atendimentos
        WHERE
            estabelecimento_id IN (
                SELECT id
                FROM estabelecimentos
                WHERE
                    user_id = auth.uid ()
            )
    )
);

-- Políticas RLS para atendimentos_colaboradores
CREATE POLICY "Usuários podem ver colaboradores de seus atendimentos" ON atendimentos_colaboradores FOR
SELECT USING (
        atendimento_id IN (
            SELECT id
            FROM atendimentos
            WHERE
                estabelecimento_id IN (
                    SELECT id
                    FROM estabelecimentos
                    WHERE
                        user_id = auth.uid ()
                )
        )
    );

CREATE POLICY "Usuários podem inserir colaboradores em seus atendimentos" ON atendimentos_colaboradores FOR
INSERT
WITH
    CHECK (
        atendimento_id IN (
            SELECT id
            FROM atendimentos
            WHERE
                estabelecimento_id IN (
                    SELECT id
                    FROM estabelecimentos
                    WHERE
                        user_id = auth.uid ()
                )
        )
    );

CREATE POLICY "Usuários podem atualizar colaboradores de seus atendimentos" ON atendimentos_colaboradores FOR
UPDATE USING (
    atendimento_id IN (
        SELECT id
        FROM atendimentos
        WHERE
            estabelecimento_id IN (
                SELECT id
                FROM estabelecimentos
                WHERE
                    user_id = auth.uid ()
            )
    )
);

CREATE POLICY "Usuários podem deletar colaboradores de seus atendimentos" ON atendimentos_colaboradores FOR DELETE USING (
    atendimento_id IN (
        SELECT id
        FROM atendimentos
        WHERE
            estabelecimento_id IN (
                SELECT id
                FROM estabelecimentos
                WHERE
                    user_id = auth.uid ()
            )
    )
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_atendimentos_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_atendimentos_updated_at 
    BEFORE UPDATE ON atendimentos 
    FOR EACH ROW EXECUTE FUNCTION update_atendimentos_updated_at_column();

-- Função para calcular valor total do atendimento automaticamente
CREATE OR REPLACE FUNCTION calculate_atendimento_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar o valor total do atendimento baseado nos serviços
    UPDATE atendimentos 
    SET valor_total = (
        SELECT COALESCE(SUM(ats.preco), 0.00)
        FROM atendimentos_servicos ats
        WHERE ats.atendimento_id = NEW.atendimento_id
    )
    WHERE id = NEW.atendimento_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para recalcular total quando serviços são adicionados/removidos/alterados
CREATE TRIGGER calculate_total_on_servico_change
    AFTER INSERT OR UPDATE OR DELETE ON atendimentos_servicos
    FOR EACH ROW EXECUTE FUNCTION calculate_atendimento_total();

-- Adicionar campo para indicar se atendimento foi criado a partir de agendamento
ALTER TABLE atendimentos
ADD COLUMN IF NOT EXISTS origem VARCHAR(20) DEFAULT 'direto' CHECK (
    origem IN ('agendamento', 'direto')
);

-- Comentários para documentação
COMMENT ON
TABLE atendimentos IS 'Tabela principal de atendimentos realizados no estabelecimento';

COMMENT ON COLUMN atendimentos.agendamento_id IS 'Referência ao agendamento original (null para atendimentos diretos)';

COMMENT ON COLUMN atendimentos.status IS 'Status: agendado, em_andamento, finalizado, cancelado';

COMMENT ON COLUMN atendimentos.origem IS 'Origem: agendamento (convertido) ou direto (criado diretamente)';

COMMENT ON
TABLE atendimentos_servicos IS 'Relação many-to-many entre atendimentos e serviços';

COMMENT ON
TABLE atendimentos_colaboradores IS 'Relação many-to-many entre atendimentos e colaboradores';