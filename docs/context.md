# 📦 Contexto de Implementação

## **Giro no Mercado — Next.js + Supabase**

---

## 🧱 Stack Técnica

- **Framework**: Next.js `16.1.4` (App Router)
- **Linguagem**: TypeScript `5`
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Custom (bcrypt + username/password)
- **Estilização**: Tailwind CSS `4`
- **Formulários**: React Hook Form
- **Ícones**: Lucide React
- **Porta da aplicação**: `3458`

---

## 📁 Estrutura de Pastas

```
src/
├── app/
│   ├── page.tsx (onboarding em passos)
│   ├── login/
│   │   └── page.tsx
│   ├── cadastro/
│   │   ├── cliente/page.tsx
│   │   ├── comerciante/page.tsx
│   │   └── entregador/page.tsx
│   ├── cliente/page.tsx
│   ├── comerciante/page.tsx
│   ├── entregador/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── context/
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
└── lib/
    ├── supabase.ts
    └── auth.ts

```

---

## 🔐 Variáveis de Ambiente

```
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave

```

---

## 🗄️ Schema do Banco de Dados (Supabase)

### 👤 Usuários (Autenticação Customizada)

```sql
CREATE TABLE usuarios (
  id UUIDPRIMARY KEYDEFAULT gen_random_uuid(),
  username TEXTUNIQUENOT NULL,
  password_hash TEXTNOT NULL,
  nome_completo TEXTNOT NULL,
  tipo_usuario TEXTNOT NULLCHECK (tipo_usuarioIN ('cliente','comerciante','entregador')),
  ativoBOOLEANDEFAULTtrue,
  criado_emTIMESTAMPWITHTIME ZONEDEFAULT NOW(),
  ultimo_loginTIMESTAMPWITHTIME ZONE
);

```

---

### 🔑 Sessões (Lembrar-me)

```sql
CREATE TABLE sessoes (
  id UUIDPRIMARY KEYDEFAULT gen_random_uuid(),
  usuario_id UUIDREFERENCES usuarios(id)ONDELETE CASCADE,
  token TEXTUNIQUENOT NULL,
  expira_emTIMESTAMPWITHTIME ZONENOT NULL,
  criado_emTIMESTAMPWITHTIME ZONEDEFAULT NOW()
);

```

---

### 🏪 Comerciantes

```sql
CREATE TABLE comerciantes (
  id UUIDPRIMARY KEYDEFAULT gen_random_uuid(),
  usuario_id UUIDREFERENCES usuarios(id)ONDELETE CASCADEUNIQUE,
  banca_nome TEXTNOT NULL,
  banca_codigo TEXT,
  galpaoINTEGERCHECK (galpaoBETWEEN1AND4),
  foto_url TEXT,
  ativoBOOLEANDEFAULTtrue
);

```

---

### 📦 Produtos

```sql
CREATE TABLE produtos (
  id UUIDPRIMARY KEYDEFAULT gen_random_uuid(),
  comerciante_id UUIDREFERENCES comerciantes(id)ONDELETE CASCADE,
  nome TEXTNOT NULL,
  categoria TEXTNOT NULL,
  unidade TEXTNOT NULL,
  precoDECIMAL(10,2)NOT NULL,
  foto_url TEXT,
  cota_disponivelINTEGER,
  ativoBOOLEANDEFAULTtrue
);

```

---

### 🛵 Entregadores

```sql
CREATE TABLE entregadores (
  id UUIDPRIMARY KEYDEFAULT gen_random_uuid(),
  usuario_id UUIDREFERENCES usuarios(id)ONDELETE CASCADEUNIQUE,
  avaliacoes_mediaDECIMAL(2,1)DEFAULT5.0,
  total_avaliacoesINTEGERDEFAULT0,
  total_entregasINTEGERDEFAULT0,
  saldo_carteiraDECIMAL(10,2)DEFAULT0,
  disponivelBOOLEANDEFAULTtrue,
  criado_emTIMESTAMPWITHTIME ZONEDEFAULT NOW
);

```

---

### 🧾 Pedidos

```sql
CREATE TABLE pedidos (
  id UUIDPRIMARY KEYDEFAULT gen_random_uuid(),
  cliente_id UUIDREFERENCES usuarios(id)NOT NULL,
  status TEXTNOT NULLDEFAULT'aguardando_aprovacao',
  entrada_retirada TEXTNOT NULL,
  horario_retiradaTIMESTAMPWITHTIME ZONENOT NULL,
  valor_produtosDECIMAL(10,2)NOT NULL,
  taxa_entregaDECIMAL(10,2)DEFAULT5.00,
  valor_totalDECIMAL(10,2)NOT NULL,
  entregador_id UUIDREFERENCES usuarios(id),
  metodo_pagamento TEXTDEFAULT'pix_mockado',
  pago_emTIMESTAMPWITHTIME ZONE,
  criado_emTIMESTAMPWITHTIME ZONEDEFAULT NOW()
);

```

---

### 📄 Itens do Pedido

```sql
CREATE TABLE itens_pedido (
  id UUIDPRIMARY KEYDEFAULT gen_random_uuid(),
  pedido_id UUIDREFERENCES pedidos(id)ONDELETE CASCADE,
  produto_id UUIDREFERENCES produtos(id),
  comerciante_id UUIDREFERENCES comerciantes(id),
  produto_nome TEXTNOT NULL,
  quantidadeDECIMAL(10,2)NOT NULL,
  unidade TEXTNOT NULL,
  preco_unitarioDECIMAL(10,2)NOT NULL,
  preco_totalDECIMAL(10,2)NOT NULL,
  status TEXTDEFAULT'pendente'
);

```

---

## 🎨 Paleta de Cores (Tailwind CSS Customizado)

### Variáveis CSS (`globals.css`)

```css
:root {
--giro-azul-escuro:#0460d9;
--giro-azul-medio:#4f7bbf;
--giro-verde-escuro:#038c25;
--giro-verde-claro:#65a603;
--giro-amarelo:#d9a404;

--neutral-0:#ffffff;
--neutral-50:#f9fafb;
--neutral-100:#f3f4f6;
--neutral-200:#e5e7eb;
--neutral-300:#d1d5db;
--neutral-600:#4b5563;
--neutral-700:#374151;
--neutral-900:#111827;

--success:#10b981;
--error:#ef4444;

--gradient-secundario:linear-gradient(135deg,#038c250%,#65a603100%);
}

```

### Classes Tailwind Customizadas

- `bg-giro-azul-escuro`, `bg-giro-azul-medio`
- `bg-giro-verde-escuro`, `bg-giro-verde-claro`
- `bg-giro-amarelo`
- `bg-gradient-secundario`
- `text-giro-*`, `border-giro-*`

---

## 🧠 Diretrizes de UX/UI

### 1. Mobile-First

- Público com baixa expertise digital
- Botões com `min-height: 48px` (`btn-touch`)
- Textos ≥ `16px`

### 2. Sem Hover

- ❌ Nunca usar `:hover`
- ✅ Usar apenas `active:`
    - Ex: `active:opacity-80`, `active:bg-neutral-50`

### 3. Tudo Clicável é Botão

- Usar `<button>` para qualquer ação
- Links devem **parecer botões**
- Affordance visual clara

### 4. Cadastro em Passos

- 1 campo principal por tela
- Barra de progresso
- Botões grandes: **Voltar / Continuar**
- Validação em tempo real com `react-hook-form`

### 5. Senhas Visíveis por Padrão

- `type="text"` inicialmente
- Toggle com `Eye / EyeOff` (Lucide)
- Foco em acessibilidade

### 6. Onboarding Progressivo

1. **Já tenho conta** × **Primeira vez aqui**
2. Escolha do tipo de usuário
    - Cliente
    - Feirante
    - Entregador

### 7. Notificações

- Contexto: `NotificationContext`
- Tipos: `success`, `error`, `warning`, `info`

```tsx
success('Mensagem')
error('Mensagem')

```

---

## 🔐 Autenticação Customizada

### Regras

- ❌ Não usar Supabase Auth
- `bcryptjs` (rounds: `10`)
- Sessão com **cookies + localStorage**
- Token via `crypto.randomUUID()`

### Fluxo de Login

```tsx
import { login }from'@/lib/auth'
import { useAuth }from'@/context/AuthContext'

const { setUser } =useAuth()
const user =awaitlogin(username, password, lembrarMe)
setUser(user)

switch (user.tipo_usuario) {
case'cliente':
    router.push('/cliente')
case'comerciante':
    router.push('/comerciante')
case'entregador':
    router.push('/entregador')
}

```

### Fluxo de Cadastro

```tsx
// 1. Verificar username
const {data: existente } =await supabase
  .from('usuarios')
  .select('username')
  .eq('username', username)

// 2. Hash da senha
const password_hash =await bcrypt.hash(password,10)

// 3. Inserir usuário
const {data: usuario } =await supabase
  .from('usuarios')
  .insert({ username, password_hash, nome_completo, tipo_usuario })
  .select()
  .single()

// 4. Inserir dados específicos (comerciante/entregador)

```

---

## 📦 Imports Importantes

```tsx
import { supabase }from'@/lib/supabase'
import { useAuth }from'@/context/AuthContext'
import { useNotification }from'@/context/NotificationContext'

```

### Lucide React

```tsx
import {
Eye,
EyeOff,
ArrowRight,
ArrowLeft,
ShoppingCart,
Store,
Package
}from'lucide-react'

```

### ESLint (desabilitar no topo)

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

```

---

## 🖼️ Assets

### Logos

- `/LOGO-GIRO-NO-MERCADO.png` (sem texto)
- `/LOGO-COM-TEXTO.png` (preferencial)

### Uso de Imagens

```tsx
<Image
  src="/LOGO-COM-TEXTO.png"
  alt="Giro no Mercado"
  fill
  className="object-contain"
  priority
/>

```

---

## 📌 Regras de Negócio

- Entregadores: **não perguntar veículo**
- Pagamento: **mockado no frontend**
- Taxa de entrega: **R$ 5,00**
- Galpões: `1 | 2 | 3 | 4`
- Categorias: `frutas`, `legumes`, `hortalicas`
- Unidades: `kg`, `unidade`, `maço`

---

## 🧪 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm run start

```

---

## 🚀 Próximas Implementações Sugeridas

- Toast visual de notificações
- Carrinho do cliente (`/cliente/carrinho`)
- Gestão de produtos do comerciante
- Sistema de pedidos (criação, aprovação, entrega)
- Upload de imagens (Supabase Storage)
- Filtro por categoria
- Sistema de avaliações

---

## ⚠️ Observações Finais

- Sempre validar formulários
- Sempre notificar o usuário
- Sempre proteger rotas por tipo de usuário
- Sempre usar `active:` em vez de `hover:`
- Sempre botões grandes (`btn-touch`)
- Sempre **simplificar a experiência**