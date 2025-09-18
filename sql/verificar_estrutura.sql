-- Script de verificação e criação da tabela agendamentos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela estabelecimentos
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE
    table_name = 'estabelecimentos'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela agendamentos já existe
SELECT EXISTS (
        SELECT
        FROM information_schema.tables
        WHERE
            table_name = 'agendamentos'
    ) as agendamentos_existe;

-- 3. Se a tabela agendamentos existe, mostrar sua estrutura
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE
    table_name = 'agendamentos'
ORDER BY ordinal_position;

-- 4. Mostrar constraints existentes
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND (
        tc.table_name = 'agendamentos'
        OR ccu.table_name = 'estabelecimentos'
    );