-- Script para criar tabela agendamentos - VERSÃO SIMPLIFICADA
-- Execute este script se o anterior não funcionar

-- Primeiro, vamos garantir que temos uma tabela de servicos
CREATE TABLE IF NOT EXISTS servicos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    descricao text,
    duracao_minutos integer DEFAULT 60,
    preco decimal(10,2),
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar a tabela agendamentos sem foreign keys primeiro
CREATE TABLE IF NOT EXISTS agendamentos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_nome text NOT NULL,
    cliente_telefone text,
    cliente_email text,
    data_agendamento date NOT NULL,
    hora_inicio time NOT NULL,
    hora_fim time NOT NULL,
    servico_id uuid,
    observacoes text,
    status text DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar foreign key para servicos se a tabela existir
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'servicos') THEN
        -- Verificar se a constraint já existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'agendamentos_servico_id_fkey' 
            AND table_name = 'agendamentos'
        ) THEN
            ALTER TABLE agendamentos 
            ADD CONSTRAINT agendamentos_servico_id_fkey 
            FOREIGN KEY (servico_id) REFERENCES servicos(id);
        END IF;
    END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos (data_agendamento);

CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos (status);

-- Habilitar RLS
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir tudo por enquanto)
CREATE POLICY IF NOT EXISTS "Permitir tudo para agendamentos" ON agendamentos FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Permitir tudo para servicos" ON servicos FOR ALL USING (true);

-- Inserir alguns serviços básicos se a tabela estiver vazia
INSERT INTO
    servicos (
        nome,
        descricao,
        duracao_minutos,
        preco
    )
SELECT *
FROM (
        VALUES (
                'Consulta', 'Consulta geral', 30, 50.00
            ), (
                'Procedimento', 'Procedimento especializado', 60, 100.00
            ), (
                'Avaliação', 'Avaliação inicial', 45, 75.00
            )
    ) AS v (
        nome, descricao, duracao_minutos, preco
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM servicos
        LIMIT 1
    );