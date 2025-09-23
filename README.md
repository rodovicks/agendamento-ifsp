# App Agendamentos IFSP....

Aplicativo para gerenciamento de agendamentos do IFSP com autenticação integrada.

## Funcionalidades Implementadas

### 🔐 Sistema de Autenticação

- **Tela de Login**: Interface moderna com campos de email e senha
- **Cadastro de Usuário**: Permite criar novas contas
- **Autenticação Automática**: Redireciona automaticamente baseado no estado de login
- **Logout Seguro**: Opção de sair com confirmação
- **Gerenciamento de Estado**: Usando Zustand para controle do estado de autenticação

### 🎨 Interface

- **Design Responsivo**: Utiliza TailwindCSS/NativeWind
- **Componentes Reutilizáveis**: Button, Input, Container personalizados
- **Navegação Intuitiva**: Tab navigator com ícones FontAwesome
- **Loading States**: Indicadores visuais durante carregamento

## Estrutura de Arquivos Criados/Modificados

```
components/
├── Input.tsx          # Componente de input personalizado
├── Container.tsx      # Container com suporte a className
└── Button.tsx         # Já existia, mantido

screens/
├── login.tsx          # Tela principal de login/cadastro
└── configuracoes.tsx  # Tela de configurações com logout

store/
└── authStore.ts       # Estado global de autenticação

navigation/
├── RootNavigator.tsx  # Navegação raiz com controle de auth
└── tab-navigator.tsx  # Atualizado com nova tela de config

App.tsx               # Atualizado para usar RootNavigator
.env.example          # Exemplo de variáveis de ambiente
```

## Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure suas credenciais do Supabase:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas informações:

```
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 2. Configuração do Supabase

No painel do Supabase, certifique-se de ter:

- Autenticação habilitada
- Política de Row Level Security configurada (se necessário)
- Email templates configurados para confirmação de conta

## Como Usar

### Login/Cadastro

1. Na primeira execução, o usuário será direcionado para a tela de login
2. Pode alternar entre "Entrar" e "Criar Conta" usando o link na parte inferior
3. Para cadastro, será enviado um email de confirmação
4. Após login bem-sucedido, é redirecionado automaticamente para o app

### Logout

1. Acesse a aba "Configurações" no tab navigator
2. Role até o final e clique em "Sair"
3. Confirme a ação na modal de confirmação

## Componentes Principais

### AuthStore (`store/authStore.ts`)

Gerencia o estado global de autenticação usando Zustand:

- `user`: Dados do usuário logado
- `session`: Sessão ativa do Supabase
- `loading`: Estado de carregamento
- `signOut()`: Função para logout
- `initialize()`: Inicializa listeners de autenticação

### RootNavigator (`navigation/RootNavigator.tsx`)

Controla a navegação baseada no estado de autenticação:

- Se não autenticado: mostra stack com tela de login
- Se autenticado: mostra stack principal com tabs

### LoginScreen (`screens/login.tsx`)

Tela completa de autenticação com:

- Formulário responsivo
- Validação de campos
- Alternância entre login/cadastro
- Tratamento de erros
- Estados de loading

## Próximos Passos Sugeridos

1. **Recuperação de Senha**: Implementar funcionalidade "Esqueci minha senha"
2. **Validação de Formulário**: Adicionar validação mais robusta (email válido, força da senha)
3. **Perfil do Usuário**: Expandir tela de configurações com edição de perfil
4. **Biometria**: Adicionar autenticação biométrica (opcional)
5. **Tema**: Implementar alternância entre tema claro/escuro
6. **Notificações**: Configurar push notifications
7. **Onboarding**: Adicionar tutorial para novos usuários

## Tecnologias Utilizadas

- **React Native + Expo**
- **TypeScript**
- **Supabase** (Backend as a Service)
- **Zustand** (Gerenciamento de estado)
- **React Navigation** (Navegação)
- **NativeWind/TailwindCSS** (Estilização)
- **FontAwesome** (Ícones)
