# Solução para Dados do Estabelecimento

## Problema Identificado

O usuário pode se cadastrar mas os dados do estabelecimento não são inseridos na tabela `estabelecimentos`.

## Solução Implementada

### 1. Correções na Tela de Login (`screens/login.tsx`)

- Melhorado o tratamento de erros na inserção dos dados do estabelecimento
- Adicionada verificação se o usuário foi criado antes de tentar inserir estabelecimento
- Mensagem de erro específica se falhar a inserção do estabelecimento

### 2. Script SQL para Supabase (`supabase_schema.sql`)

**Execute este script no SQL Editor do Supabase para criar a tabela:**

```sql
-- Criar tabela de estabelecimentos
CREATE TABLE IF NOT EXISTS estabelecimentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    endereco TEXT NOT NULL,
    ramo VARCHAR(255) NOT NULL,
    logo TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de segurança RLS
ALTER TABLE estabelecimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas seus estabelecimentos"
ON estabelecimentos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus estabelecimentos"
ON estabelecimentos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus estabelecimentos"
ON estabelecimentos FOR UPDATE
USING (auth.uid() = user_id);
```

### 3. Serviço de Estabelecimento (`utils/estabelecimento.ts`)

- Criado serviço completo para gerenciar dados do estabelecimento
- Função para verificar se estabelecimento existe, se não, criar automaticamente
- Funções para CRUD completo (criar, ler, atualizar, deletar)

### 4. Store Atualizado (`store/authStore.ts`)

- Adicionado estado do estabelecimento no store global
- Carregamento automático dos dados do estabelecimento após login
- Limpeza dos dados ao fazer logout

### 5. Tela de Configurações Atualizada (`screens/configuracoes.tsx`)

- Mostra dados completos do estabelecimento
- Aviso se dados estão incompletos
- Opção para editar perfil

## Como Usar

### Para Novos Usuários:

1. Execute o script SQL no Supabase
2. O usuário se cadastra normalmente
3. Se houver erro na inserção, ele pode completar depois no perfil
4. O sistema tenta recuperar automaticamente os dados do metadata

### Para Usuários Existentes:

1. Execute o script SQL no Supabase
2. O sistema tentará criar o estabelecimento automaticamente com dados do metadata
3. Se não conseguir, mostra aviso na tela de configurações

### Verificação no Console:

- Erros de inserção aparecem no console do desenvolvedor
- Logs detalhados para debug

## Estrutura da Tabela Estabelecimentos

| Campo      | Tipo         | Obrigatório | Descrição                |
| ---------- | ------------ | ----------- | ------------------------ |
| id         | UUID         | Sim         | Chave primária           |
| user_id    | UUID         | Sim         | Referência ao usuário    |
| nome       | VARCHAR(255) | Sim         | Nome do estabelecimento  |
| email      | VARCHAR(255) | Sim         | Email do estabelecimento |
| telefone   | VARCHAR(20)  | Sim         | Telefone                 |
| endereco   | TEXT         | Sim         | Endereço completo        |
| ramo       | VARCHAR(255) | Sim         | Ramo de atividade        |
| logo       | TEXT         | Não         | URL do logotipo          |
| created_at | TIMESTAMP    | Sim         | Data de criação          |
| updated_at | TIMESTAMP    | Sim         | Data de atualização      |

## Próximos Passos

1. Implementar tela de edição de perfil
2. Adicionar upload de imagem para logotipo
3. Implementar autenticação biométrica
4. Adicionar validação de campos (telefone, email)
5. Melhorar UX com loading states
