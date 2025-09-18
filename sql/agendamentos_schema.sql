-- Schema para tabela de agendamentos
-- Execute este script no SQL Editor do Supabase

-- Verificar se as tabelas necessárias existem
DO $$
BEGIN
    -- Verificar se a tabela estabelecimentos existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'estabelecimentos') THEN
        RAISE EXCEPTION 'Tabela estabelecimentos não encontrada. Crie-a primeiro.';
    END IF;
    
    -- Verificar se a tabela colaboradores existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'colaboradores') THEN
        RAISE NOTICE 'Tabela colaboradores não encontrada. A referência será opcional.';
    END IF;
    
    -- Verificar se a tabela servicos existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'servicos') THEN
        RAISE NOTICE 'Tabela servicos não encontrada. Será criada se necessário.';
    END IF;
END $$;

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    estabelecimento_id uuid NOT NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_telefone VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(255),
    data_agendamento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado')),
    servico_id int4,
    colaborador_id int4,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar as constraints de foreign key apenas se as tabelas referenciadas existirem
DO $$
BEGIN
    -- Adicionar FK para estabelecimentos se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'agendamentos_estabelecimento_id_fkey'
        AND table_name = 'agendamentos'
    ) THEN
        ALTER TABLE agendamentos 
        ADD CONSTRAINT agendamentos_estabelecimento_id_fkey 
        FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;
    END IF;
    
    -- Adicionar FK para colaboradores se a tabela existir e a constraint não existir
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'colaboradores') AND
       NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'agendamentos_colaborador_id_fkey'
           AND table_name = 'agendamentos'
       ) THEN
        ALTER TABLE agendamentos 
        ADD CONSTRAINT agendamentos_colaborador_id_fkey 
        FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE SET NULL;
    END IF;

    -- Adicionar FK para servicos se a tabela existir e a constraint não existir
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'servicos') AND
       NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'agendamentos_servico_id_fkey'
           AND table_name = 'agendamentos'
       ) THEN
        ALTER TABLE agendamentos 
        ADD CONSTRAINT agendamentos_servico_id_fkey 
        FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_estabelecimento_id ON agendamentos (estabelecimento_id);

CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos (data_agendamento);

CREATE INDEX IF NOT EXISTS idx_agendamentos_colaborador ON agendamentos (colaborador_id);

CREATE INDEX IF NOT EXISTS idx_agendamentos_servico ON agendamentos (servico_id);

CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos (status);

-- Habilitar RLS (Row Level Security)
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para agendamentos
CREATE POLICY "Usuários podem ver agendamentos de seus estabelecimentos" ON agendamentos FOR
SELECT USING (
        estabelecimento_id IN (
            SELECT id
            FROM estabelecimentos
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Usuários podem inserir agendamentos em seus estabelecimentos" ON agendamentos FOR
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

CREATE POLICY "Usuários podem atualizar agendamentos de seus estabelecimentos" ON agendamentos FOR
UPDATE USING (
    estabelecimento_id IN (
        SELECT id
        FROM estabelecimentos
        WHERE
            user_id = auth.uid ()
    )
);

CREATE POLICY "Usuários podem deletar agendamentos de seus estabelecimentos" ON agendamentos FOR DELETE USING (
    estabelecimento_id IN (
        SELECT id
        FROM estabelecimentos
        WHERE
            user_id = auth.uid ()
    )
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_agendamentos_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_agendamentos_updated_at 
    BEFORE UPDATE ON agendamentos 
    FOR EACH ROW EXECUTE FUNCTION update_agendamentos_updated_at_column();

-- Adicionar campo favorito à tabela servicos se não existir
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'servicos') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'servicos' AND column_name = 'favorito'
        ) THEN
            ALTER TABLE servicos ADD COLUMN favorito BOOLEAN DEFAULT FALSE;
        END IF;
    END IF;
END $$;

-- Comentários para documentação
COMMENT ON
TABLE agendamentos IS 'Tabela que armazena os agendamentos dos estabelecimentos';

COMMENT ON COLUMN agendamentos.servico_id IS 'ID do serviço agendado';

COMMENT ON COLUMN agendamentos.status IS 'Status do agendamento: agendado, confirmado, em_andamento, concluido, cancelado';

-- Inserir dados de exemplo para testes (opcional)
-- Descomente as linhas abaixo para inserir dados de teste
/*
INSERT INTO agendamentos (
estabelecimento_id,
cliente_nome,
cliente_telefone,
cliente_email,
data_agendamento,
hora_inicio,
hora_fim,
servico_id,
colaborador_id,
observacoes
) VALUES 
(
(SELECT id FROM estabelecimentos LIMIT 1),
'João Silva',
'+5511999999999',
'joao@email.com',
CURRENT_DATE + INTERVAL '1 day',
'09:00',
'10:00',
(SELECT id FROM servicos LIMIT 1),
(SELECT id FROM colaboradores LIMIT 1),
'Agendamento de teste'
),
(
(SELECT id FROM estabelecimentos LIMIT 1),
'Maria Santos',
'+5511888888888',
'maria@email.com',
CURRENT_DATE + INTERVAL '2 days',
'14:00',
'15:30',
(SELECT id FROM servicos LIMIT 1),
(SELECT id FROM colaboradores LIMIT 1),
'Consulta de rotina'
);
*/