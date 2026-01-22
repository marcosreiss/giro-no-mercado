# 🧪 Guia de Teste Completo - Giro no Mercado

## 📋 Pré-requisitos

### 1. Configurar o Supabase
1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Cole todo o conteúdo de `supabase-setup.sql`
5. Clique em **Run** (Ctrl+Enter)
6. Verifique se retornou "Tabelas criadas: 7"

### 2. Iniciar o sistema
```bash
npm run dev
```

Acesse: http://localhost:3458

---

## 🎯 Fluxo Completo de Teste

### ETAPA 1: Cadastrar Comerciante

1. Na tela inicial, clique **"Sou Comerciante"**
2. Preencha:
   - Nome completo: `João da Feira`
   - Nome de usuário: `joao`
   - Senha: `123456`
   - Nome da banca: `Frutas do João`
   - Galpão: `1`
   - Código da banca (opcional): `A10`
3. Clique **"Criar Conta"**
4. Faça login com: `joao` / `123456`

### ETAPA 2: Cadastrar Produtos

1. Após login como comerciante, clique **"Gerenciar Produtos"**
2. Clique **"+ Novo Produto"** (botão flutuante no canto)
3. Cadastre 3 produtos:

**Produto 1:**
- Nome: `Banana Prata`
- Categoria: `frutas`
- Preço: `4.50`
- Unidade: `kg`
- Cota disponível: `50`

**Produto 2:**
- Nome: `Tomate`
- Categoria: `legumes`
- Preço: `6.00`
- Unidade: `kg`
- Cota disponível: `30`

**Produto 3:**
- Nome: `Alface`
- Categoria: `hortalicas`
- Preço: `3.00`
- Unidade: `unidade`
- Cota disponível: `20`

4. Volte para **"Meus Produtos"** e verifique se os 3 produtos aparecem

### ETAPA 3: Cadastrar Entregador

1. Faça **logout** (ícone de saída no menu)
2. Na tela inicial, clique **"Sou Entregador"**
3. Preencha:
   - Nome completo: `Carlos Motoboy`
   - Nome de usuário: `carlos`
   - Senha: `123456`
4. Clique **"Criar Conta"**
5. Faça login com: `carlos` / `123456`
6. Verifique que a tela mostra: **"Nenhuma entrega disponível"** (normal, ainda não há pedidos)

### ETAPA 4: Cadastrar Cliente e Fazer Pedido

1. Faça **logout**
2. Na tela inicial, clique **"Sou Cliente"**
3. Preencha:
   - Nome completo: `Maria Silva`
   - Nome de usuário: `maria`
   - Senha: `123456`
4. Faça login com: `maria` / `123456`
5. **Verifique se os 3 produtos aparecem na tela principal** ✅
6. Adicione ao carrinho:
   - 2kg de Banana Prata
   - 1kg de Tomate
7. Clique no botão flutuante do carrinho (canto inferior direito)
8. Na tela de carrinho:
   - Selecione entrada: `Entrada 1`
   - Selecione horário: qualquer horário futuro
   - Clique **"Ir para Pagamento"**

### ETAPA 5: Simular Pagamento (MOCKADO)

1. Na tela de checkout:
   - Código PIX: `PIX123FAKE` (já preenchido)
   - Clique **"Confirmar Pagamento PIX"**
2. Aguarde 3 segundos (simulação de pagamento)
3. Verifique a mensagem: **"Pagamento confirmado!"** ✅
4. Clique **"Ver Meus Pedidos"**
5. **Verifique se o pedido aparece com status "Aguardando Aprovação"** ✅

### ETAPA 6: Comerciante Aprova o Pedido

1. Faça **logout**
2. Faça login como comerciante: `joao` / `123456`
3. Vá em **"Pedidos"** (menu)
4. **Verifique se o pedido da Maria aparece** ✅
5. **Verifique se há o badge "✓ Pago"** ✅
6. Clique **"Aceitar Pedido"**
7. Verifique a mensagem: **"Pedido aceito com sucesso!"** ✅
8. O pedido desaparece da lista (foi aprovado)

### ETAPA 7: Entregador Aceita a Entrega

1. Faça **logout**
2. Faça login como entregador: `carlos` / `123456`
3. Vá na aba **"Disponíveis"**
4. **Verifique se o pedido da Maria aparece** ✅
5. **Console deve mostrar**: 
   - `🔍 Buscando pedidos disponíveis...`
   - `📦 Pedidos encontrados: 1`
   - `✅ Primeiro pedido: {status: 'aprovado', pago_em: ...}`
6. Clique **"Aceitar Entrega"**
7. Vá na aba **"Minhas"**
8. **Verifique se o pedido aparece em "Minhas Entregas"** ✅
9. Clique **"Iniciar Entrega"**
10. Após "entregar", clique **"Finalizar Entrega"**

### ETAPA 8: Cliente Confirma Recebimento

1. Faça **logout**
2. Faça login como cliente: `maria` / `123456`
3. Vá em **"Pedidos"** (menu)
4. **Verifique se o pedido aparece com status "Aguardando Confirmação"** ✅
5. Clique **"Confirmar Recebimento"**
6. Vá na aba **"Histórico"**
7. **Verifique se o pedido aparece com status "Entregue"** ✅

---

## ✅ Checklist de Validação

### Banco de Dados (Supabase)
- [ ] Script SQL executado sem erros
- [ ] 7 tabelas criadas
- [ ] Políticas RLS ativas
- [ ] Triggers criados

### Comerciante
- [ ] Consegue se cadastrar
- [ ] Consegue fazer login
- [ ] Consegue cadastrar produtos
- [ ] Produtos aparecem na lista
- [ ] Consegue editar produtos
- [ ] Consegue ver pedidos pagos
- [ ] Badge "✓ Pago" aparece
- [ ] Consegue aprovar pedidos

### Cliente
- [ ] Consegue se cadastrar
- [ ] Consegue fazer login
- [ ] **Produtos do comerciante aparecem** ✅
- [ ] Consegue adicionar ao carrinho
- [ ] Carrinho salva no localStorage
- [ ] Consegue escolher entrada/horário
- [ ] Consegue simular pagamento PIX
- [ ] Pedido aparece em "Meus Pedidos"
- [ ] Status do pedido atualiza corretamente
- [ ] Consegue confirmar recebimento

### Entregador
- [ ] Consegue se cadastrar
- [ ] Consegue fazer login
- [ ] **Pedidos aprovados E pagos aparecem** ✅
- [ ] Console mostra logs de debug
- [ ] Consegue aceitar entrega
- [ ] Pedido move para "Minhas"
- [ ] Consegue finalizar entrega
- [ ] Estatísticas atualizam

### Fluxo Completo
- [ ] Cliente cria pedido → Status: aguardando_aprovacao
- [ ] Cliente paga (mock) → pago_em preenchido
- [ ] Comerciante vê pedido → Badge "✓ Pago"
- [ ] Comerciante aprova → Status: aprovado
- [ ] Entregador vê na lista → Pedidos disponíveis
- [ ] Entregador aceita → Status: em_entrega
- [ ] Entregador finaliza → Status: aguardando_confirmacao
- [ ] Cliente confirma → Status: entregue
- [ ] Estatísticas atualizam ✅

---

## 🐛 Solução de Problemas

### Produtos não aparecem para o cliente
1. Verifique se o comerciante cadastrou produtos
2. No Supabase, vá em **Table Editor** → `produtos`
3. Confirme que `ativo = true`

### Entregador não vê pedidos
1. Abra o **Console do navegador** (F12)
2. Procure por: `🔍 Buscando pedidos disponíveis...`
3. Verifique: `📦 Pedidos encontrados: X`
4. Se for 0, confirme:
   - Pedido foi **pago** (pago_em não é null)
   - Pedido foi **aprovado** (status = 'aprovado')
   - Pedido não tem entregador (entregador_id = null)

### Erro "policy does not exist"
1. Execute o script `supabase-setup.sql` novamente
2. Todas as políticas RLS serão criadas

### Erro ao cadastrar
1. Verifique se as tabelas foram criadas
2. No Supabase: **Table Editor** → verifique todas as 7 tabelas

---

## 📊 Verificar Dados no Supabase

### Ver produtos cadastrados
```sql
SELECT p.nome, p.preco, c.banca_nome
FROM produtos p
JOIN comerciantes c ON p.comerciante_id = c.id
WHERE p.ativo = true;
```

### Ver pedidos e status
```sql
SELECT 
  p.id,
  u.nome_completo as cliente,
  p.status,
  p.pago_em,
  p.valor_total
FROM pedidos p
JOIN usuarios u ON p.cliente_id = u.id
ORDER BY p.criado_em DESC;
```

### Ver pedidos disponíveis para entregador
```sql
SELECT *
FROM pedidos
WHERE status = 'aprovado'
  AND entregador_id IS NULL
  AND pago_em IS NOT NULL;
```

---

## 🎉 Próximos Passos

Após validar todo o fluxo:

1. **Produção**: Ajuste as políticas RLS para segurança
2. **Upload de imagens**: Implementar Supabase Storage
3. **Notificações**: Implementar notificações em tempo real
4. **Pagamento real**: Integrar com gateway de pagamento
5. **Geolocalização**: Adicionar mapa para entregas

---

## 📝 Notas

- Todas as senhas de teste são: `123456`
- Pagamento é mockado no frontend (3 segundos)
- Taxa de entrega fixa: R$ 5,00
- Logs detalhados aparecem no console do navegador
- RLS configurado para permitir tudo (ajustar em produção)

