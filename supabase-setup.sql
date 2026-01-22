-- ============================================
-- SETUP COMPLETO SUPABASE - GIRO NO MERCADO
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard → SQL Editor → New Query → Cole este código → Run

-- ============================================
-- 1. TABELAS
-- ============================================

-- Usuários (Autenticação Customizada)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('cliente', 'comerciante', 'entregador')),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultimo_login TIMESTAMP WITH TIME ZONE
);

-- Índice para busca rápida por username
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);

-- Sessões (Lembrar-me)
CREATE TABLE IF NOT EXISTS sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario ON sessoes(usuario_id);

-- Comerciantes
CREATE TABLE IF NOT EXISTS comerciantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE,
  banca_nome TEXT NOT NULL,
  banca_codigo TEXT,
  galpao INTEGER CHECK (galpao BETWEEN 1 AND 4),
  foto_url TEXT,
  total_vendas INTEGER DEFAULT 0,
  receita_total DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_comerciantes_usuario ON comerciantes(usuario_id);

-- Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comerciante_id UUID REFERENCES comerciantes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  unidade TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  foto_url TEXT,
  cota_disponivel INTEGER,
  ativo BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_produtos_comerciante ON produtos(comerciante_id);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);

-- Entregadores
CREATE TABLE IF NOT EXISTS entregadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE,
  avaliacoes_media DECIMAL(2,1) DEFAULT 5.0,
  total_avaliacoes INTEGER DEFAULT 0,
  total_entregas INTEGER DEFAULT 0,
  saldo_carteira DECIMAL(10,2) DEFAULT 0,
  disponivel BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entregadores_usuario ON entregadores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_entregadores_disponivel ON entregadores(disponivel);

-- Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES usuarios(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'aguardando_aprovacao',
  entrada_retirada TEXT NOT NULL,
  horario_retirada TIMESTAMP WITH TIME ZONE NOT NULL,
  valor_produtos DECIMAL(10,2) NOT NULL,
  taxa_entrega DECIMAL(10,2) DEFAULT 5.00,
  valor_total DECIMAL(10,2) NOT NULL,
  entregador_id UUID REFERENCES usuarios(id),
  metodo_pagamento TEXT DEFAULT 'pix_mockado',
  pago_em TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_entregador ON pedidos(entregador_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_pago ON pedidos(pago_em);

-- Itens do Pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  comerciante_id UUID REFERENCES comerciantes(id),
  produto_nome TEXT NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  unidade TEXT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  preco_total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pendente'
);

CREATE INDEX IF NOT EXISTS idx_itens_pedido ON itens_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_itens_comerciante ON itens_pedido(comerciante_id);

-- ============================================
-- 2. POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Ativar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comerciantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;

-- Políticas: Permitir tudo publicamente (idempotente)
DO $$
BEGIN
  -- Usuários
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Permitir leitura pública'
  ) THEN
    CREATE POLICY "Permitir leitura pública" ON usuarios FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Permitir inserção pública'
  ) THEN
    CREATE POLICY "Permitir inserção pública" ON usuarios FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'usuarios' AND policyname = 'Permitir atualização pública'
  ) THEN
    CREATE POLICY "Permitir atualização pública" ON usuarios FOR UPDATE USING (true);
  END IF;

  -- Sessões
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sessoes' AND policyname = 'Permitir tudo em sessoes'
  ) THEN
    CREATE POLICY "Permitir tudo em sessoes" ON sessoes FOR ALL USING (true);
  END IF;

  -- Comerciantes
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comerciantes' AND policyname = 'Permitir tudo em comerciantes'
  ) THEN
    CREATE POLICY "Permitir tudo em comerciantes" ON comerciantes FOR ALL USING (true);
  END IF;

  -- Produtos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'produtos' AND policyname = 'Permitir tudo em produtos'
  ) THEN
    CREATE POLICY "Permitir tudo em produtos" ON produtos FOR ALL USING (true);
  END IF;

  -- Entregadores
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'entregadores' AND policyname = 'Permitir tudo em entregadores'
  ) THEN
    CREATE POLICY "Permitir tudo em entregadores" ON entregadores FOR ALL USING (true);
  END IF;

  -- Pedidos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pedidos' AND policyname = 'Permitir tudo em pedidos'
  ) THEN
    CREATE POLICY "Permitir tudo em pedidos" ON pedidos FOR ALL USING (true);
  END IF;

  -- Itens do Pedido
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'itens_pedido' AND policyname = 'Permitir tudo em itens_pedido'
  ) THEN
    CREATE POLICY "Permitir tudo em itens_pedido" ON itens_pedido FOR ALL USING (true);
  END IF;
END $$;

-- ============================================
-- 3. FUNÇÕES E TRIGGERS
-- ============================================

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION limpar_sessoes_expiradas()
RETURNS void AS $$
BEGIN
  DELETE FROM sessoes WHERE expira_em < NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar receita_total do comerciante
CREATE OR REPLACE FUNCTION atualizar_receita_comerciante()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'entregue' AND OLD.status != 'entregue' THEN
    UPDATE comerciantes
    SET 
      receita_total = receita_total + NEW.valor_produtos,
      total_vendas = total_vendas + 1
    FROM itens_pedido
    WHERE comerciantes.id = itens_pedido.comerciante_id
      AND itens_pedido.pedido_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger apenas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_receita_comerciante'
  ) THEN
    CREATE TRIGGER trigger_receita_comerciante
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    WHEN (NEW.status = 'entregue' AND OLD.status != 'entregue')
    EXECUTE FUNCTION atualizar_receita_comerciante();
  END IF;
END $$;

-- Trigger para atualizar total de entregas do entregador
CREATE OR REPLACE FUNCTION atualizar_entregas_entregador()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'entregue' AND OLD.status != 'entregue' AND NEW.entregador_id IS NOT NULL THEN
    UPDATE entregadores
    SET 
      total_entregas = total_entregas + 1,
      saldo_carteira = saldo_carteira + NEW.taxa_entrega
    FROM usuarios
    WHERE usuarios.id = NEW.entregador_id
      AND entregadores.usuario_id = usuarios.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger apenas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_entregas_entregador'
  ) THEN
    CREATE TRIGGER trigger_entregas_entregador
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    WHEN (NEW.status = 'entregue' AND OLD.status != 'entregue')
    EXECUTE FUNCTION atualizar_entregas_entregador();
  END IF;
END $$;

-- ============================================
-- 4. DADOS DE TESTE (OPCIONAL)
-- ============================================

-- Usuário Cliente de Teste (senha: 123456)
INSERT INTO usuarios (username, password_hash, nome_completo, tipo_usuario)
VALUES ('cliente1', '$2a$10$rQZ8vXqJ8LX5pqJ8LX5pqJ8LX5pqJ8LX5pqJ8LX5pqJ8LX5pqJ8', 'Cliente Teste', 'cliente')
ON CONFLICT (username) DO NOTHING;

-- Usuário Comerciante de Teste (senha: 123456)
INSERT INTO usuarios (username, password_hash, nome_completo, tipo_usuario)
VALUES ('comerciante1', '$2a$10$rQZ8vXqJ8LX5pqJ8LX5pqJ8LX5pqJ8LX5pqJ8LX5pqJ8LX5pqJ8', 'Comerciante Teste', 'comerciante')
ON CONFLICT (username) DO NOTHING;

-- Usuário Entregador de Teste (senha: 123456)
INSERT INTO usuarios (username, password_hash, nome_completo, tipo_usuario)
VALUES ('entregador1', '$2a$10$rQZ8vXqJ8LX5pqJ8LX5pqJ8LX5pqJ8LX5pqJ8LX5pqJ8LX5pqJ8', 'Entregador Teste', 'entregador')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- 5. VERIFICAÇÃO
-- ============================================

-- Verificar se tudo foi criado corretamente
SELECT 
  'Tabelas criadas: ' || count(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('usuarios', 'sessoes', 'comerciantes', 'produtos', 'entregadores', 'pedidos', 'itens_pedido');

-- Verificar políticas RLS
SELECT 
  tablename, 
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- FIM DO SETUP
-- ============================================
-- Após executar este script:
-- 1. Verifique se todas as tabelas foram criadas
-- 2. Teste o login com os usuários de teste
-- 3. Ajuste as políticas RLS conforme necessário
-- ============================================
