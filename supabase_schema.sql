-- Criar tabela de estabelecimentos no Supabase
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS estabelecimentos (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    endereco TEXT NOT NULL,
    ramo VARCHAR(255) NOT NULL,
    logo TEXT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_user_id ON estabelecimentos (user_id);

CREATE INDEX IF NOT EXISTS idx_estabelecimentos_email ON estabelecimentos (email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE estabelecimentos ENABLE ROW LEVEL SECURITY;

-- Criar política para que usuários só vejam seus próprios dados
CREATE POLICY "Usuários podem ver apenas seus estabelecimentos" ON estabelecimentos FOR
SELECT USING (auth.uid () = user_id);

-- Criar política para que usuários possam inserir seus próprios dados
CREATE POLICY "Usuários podem inserir seus estabelecimentos" ON estabelecimentos FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

-- Criar política para que usuários possam atualizar seus próprios dados
CREATE POLICY "Usuários podem atualizar seus estabelecimentos" ON estabelecimentos FOR
UPDATE USING (auth.uid () = user_id);

-- Criar política para que usuários possam deletar seus próprios dados
CREATE POLICY "Usuários podem deletar seus estabelecimentos" ON estabelecimentos FOR DELETE USING (auth.uid () = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_estabelecimentos_updated_at 
    BEFORE UPDATE ON estabelecimentos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Criar tabela de configurações do estabelecimento
CREATE TABLE IF NOT EXISTS configuracoes_estabelecimento (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    estabelecimento_id UUID REFERENCES estabelecimentos (id) ON DELETE CASCADE,
    template_mensagem TEXT DEFAULT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_configuracoes_estabelecimento_id ON configuracoes_estabelecimento (estabelecimento_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE configuracoes_estabelecimento ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários podem ver configurações de seus estabelecimentos" ON configuracoes_estabelecimento FOR
SELECT USING (
        estabelecimento_id IN (
            SELECT id
            FROM estabelecimentos
            WHERE
                user_id = auth.uid ()
        )
    );

CREATE POLICY "Usuários podem inserir configurações de seus estabelecimentos" ON configuracoes_estabelecimento FOR
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

CREATE POLICY "Usuários podem atualizar configurações de seus estabelecimentos" ON configuracoes_estabelecimento FOR
UPDATE USING (
    estabelecimento_id IN (
        SELECT id
        FROM estabelecimentos
        WHERE
            user_id = auth.uid ()
    )
);

CREATE POLICY "Usuários podem deletar configurações de seus estabelecimentos" ON configuracoes_estabelecimento FOR DELETE USING (
    estabelecimento_id IN (
        SELECT id
        FROM estabelecimentos
        WHERE
            user_id = auth.uid ()
    )
);

-- Aplicar trigger de updated_at na tabela configurações
CREATE TRIGGER update_configuracoes_estabelecimento_updated_at BEFORE UPDATE ON configuracoes_estabelecimento FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();