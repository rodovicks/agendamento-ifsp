# Configuração do Supabase para Colaboradores

## 1. Executar SQL no Supabase

1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Execute o script `sql/colaboradores_schema.sql` completo

## 2. Criar Bucket no Storage

1. Acesse **Storage** no painel do Supabase
2. Clique em **Create Bucket**
3. Nome: `colaboradores`
4. Marque como **Public** ✅
5. Clique em **Create bucket**

## 3. Configurar Políticas do Storage (IMPORTANTE!)

Execute este SQL adicional no **SQL Editor**:

```sql
-- Políticas para o bucket colaboradores
INSERT INTO storage.buckets (id, name, public)
VALUES ('colaboradores', 'colaboradores', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir SELECT para usuários autenticados
CREATE POLICY "Users can view colaboradores photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'colaboradores' AND auth.role() = 'authenticated');

-- Permitir INSERT para usuários autenticados em suas próprias pastas
CREATE POLICY "Users can upload colaboradores photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'colaboradores'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir UPDATE para usuários autenticados em suas próprias pastas
CREATE POLICY "Users can update colaboradores photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'colaboradores'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir DELETE para usuários autenticados em suas próprias pastas
CREATE POLICY "Users can delete colaboradores photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'colaboradores'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## 4. Testar a Funcionalidade

Depois de executar esses passos:

1. ✅ **Adicionar Colaborador** - Com ícone de +
2. ✅ **Selecionar Foto** - Com ícone de câmera
3. ✅ **Editar** - Com ícone de lápis
4. ✅ **Excluir** - Com ícone de lixeira
5. ✅ **Upload de Fotos** - Corrigido para funcionar corretamente

## Estrutura das Pastas no Storage:

```
colaboradores/
  ├── {user_id}/
  │   ├── colaborador_1_timestamp.jpg
  │   ├── colaborador_2_timestamp.png
  │   └── ...
```

Cada usuário terá sua pasta própria identificada pelo `user_id`.
