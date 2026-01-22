-- ============================================
-- FIX: Adicionar colunas, corrigir triggers e sincronizar dados
-- ============================================
-- Execute no Supabase Dashboard → SQL Editor

-- 1. Adicionar coluna receita_total se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comerciantes' AND column_name = 'receita_total'
  ) THEN
    ALTER TABLE comerciantes ADD COLUMN receita_total DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- 2. Adicionar coluna total_vendas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comerciantes' AND column_name = 'total_vendas'
  ) THEN
    ALTER TABLE comerciantes ADD COLUMN total_vendas INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. Garantir que entregadores tenham saldo_carteira e total_entregas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'entregadores' AND column_name = 'saldo_carteira'
  ) THEN
    ALTER TABLE entregadores ADD COLUMN saldo_carteira DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'entregadores' AND column_name = 'total_entregas'
  ) THEN
    ALTER TABLE entregadores ADD COLUMN total_entregas INTEGER DEFAULT 0;
  END IF;
END $$;

-- 4. Dropar triggers existentes
DROP TRIGGER IF EXISTS trigger_receita_comerciante ON pedidos;
DROP TRIGGER IF EXISTS trigger_entregas_entregador ON pedidos;

-- 5. Dropar funções existentes
DROP FUNCTION IF EXISTS atualizar_receita_comerciante();
DROP FUNCTION IF EXISTS atualizar_entregas_entregador();

-- 6. Recriar função para atualizar receita do comerciante (simplificada)
CREATE OR REPLACE FUNCTION atualizar_receita_comerciante()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualiza a receita de cada comerciante que tem itens neste pedido
  UPDATE comerciantes c
  SET 
    receita_total = COALESCE(c.receita_total, 0) + ip.total_comerciante,
    total_vendas = COALESCE(c.total_vendas, 0) + 1
  FROM (
    SELECT comerciante_id, SUM(preco_total) as total_comerciante
    FROM itens_pedido
    WHERE pedido_id = NEW.id
    GROUP BY comerciante_id
  ) ip
  WHERE c.id = ip.comerciante_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Recriar trigger para receita do comerciante
CREATE TRIGGER trigger_receita_comerciante
AFTER UPDATE ON pedidos
FOR EACH ROW
WHEN (NEW.status = 'entregue' AND OLD.status IS DISTINCT FROM 'entregue')
EXECUTE FUNCTION atualizar_receita_comerciante();

-- 8. Recriar função para atualizar entregas do entregador
CREATE OR REPLACE FUNCTION atualizar_entregas_entregador()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entregador_id IS NOT NULL THEN
    UPDATE entregadores
    SET 
      total_entregas = COALESCE(total_entregas, 0) + 1,
      saldo_carteira = COALESCE(saldo_carteira, 0) + COALESCE(NEW.taxa_entrega, 5.00)
    WHERE usuario_id = NEW.entregador_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Recriar trigger para entregas do entregador
CREATE TRIGGER trigger_entregas_entregador
AFTER UPDATE ON pedidos
FOR EACH ROW
WHEN (NEW.status = 'entregue' AND OLD.status IS DISTINCT FROM 'entregue')
EXECUTE FUNCTION atualizar_entregas_entregador();

-- 10. CRIAR registros de entregadores para usuários do tipo 'entregador' que não têm registro
INSERT INTO entregadores (usuario_id, disponivel, saldo_carteira, total_entregas, avaliacoes_media, total_avaliacoes)
SELECT id, true, 0, 0, 5.0, 0
FROM usuarios 
WHERE tipo_usuario = 'entregador'
AND id NOT IN (SELECT usuario_id FROM entregadores WHERE usuario_id IS NOT NULL);

-- 11. SINCRONIZAR saldo_carteira e total_entregas dos entregadores com base nos pedidos já entregues
UPDATE entregadores e
SET 
  total_entregas = COALESCE(sub.total, 0),
  saldo_carteira = COALESCE(sub.ganhos, 0)
FROM (
  SELECT 
    p.entregador_id as usuario_id,
    COUNT(*) as total,
    SUM(COALESCE(p.taxa_entrega, 5.00)) as ganhos
  FROM pedidos p
  WHERE p.status = 'entregue' AND p.entregador_id IS NOT NULL
  GROUP BY p.entregador_id
) sub
WHERE e.usuario_id = sub.usuario_id;

-- 12. Verificar entregadores cadastrados
SELECT 'Entregadores cadastrados:' as info;
SELECT e.id, e.usuario_id, u.nome_completo, e.total_entregas, e.saldo_carteira, e.disponivel
FROM entregadores e
JOIN usuarios u ON e.usuario_id = u.id;

-- 13. Verificar usuários do tipo entregador SEM registro na tabela entregadores
SELECT 'Usuários entregador SEM registro:' as info;
SELECT u.id, u.nome_completo, u.username
FROM usuarios u
LEFT JOIN entregadores e ON e.usuario_id = u.id
WHERE u.tipo_usuario = 'entregador' AND e.id IS NULL;

-- 14. Verificar pedidos entregues
SELECT 'Pedidos entregues por entregador:' as info;
SELECT 
  p.entregador_id,
  u.nome_completo as entregador_nome,
  COUNT(*) as total_entregas,
  SUM(p.taxa_entrega) as total_ganhos
FROM pedidos p
LEFT JOIN usuarios u ON p.entregador_id = u.id
WHERE p.status = 'entregue' AND p.entregador_id IS NOT NULL
GROUP BY p.entregador_id, u.nome_completo;

-- 15. Verificar se tudo foi criado
SELECT 'Colunas comerciantes:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'comerciantes';

SELECT 'Colunas entregadores:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'entregadores';

SELECT 'Triggers em pedidos:' as info;
SELECT tgname FROM pg_trigger WHERE tgrelid = 'pedidos'::regclass;

-- ============================================
-- FIM DO FIX
-- ============================================
