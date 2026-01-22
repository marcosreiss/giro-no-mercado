-- ============================================
-- FIX TRIGGERS - GIRO NO MERCADO
-- ============================================
-- Execute este script no SQL Editor do Supabase para corrigir os triggers
-- Dashboard → SQL Editor → New Query → Cole este código → Run

-- Primeiro, dropar os triggers existentes
DROP TRIGGER IF EXISTS trigger_receita_comerciante ON pedidos;
DROP TRIGGER IF EXISTS trigger_entregas_entregador ON pedidos;

-- Dropar as funções existentes
DROP FUNCTION IF EXISTS atualizar_receita_comerciante();
DROP FUNCTION IF EXISTS atualizar_entregas_entregador();

-- Recriar a função para atualizar receita do comerciante
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

-- Recriar o trigger para receita do comerciante
CREATE TRIGGER trigger_receita_comerciante
AFTER UPDATE ON pedidos
FOR EACH ROW
WHEN (NEW.status = 'entregue' AND OLD.status != 'entregue')
EXECUTE FUNCTION atualizar_receita_comerciante();

-- Recriar a função para atualizar entregas do entregador
CREATE OR REPLACE FUNCTION atualizar_entregas_entregador()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'entregue' AND OLD.status != 'entregue' AND NEW.entregador_id IS NOT NULL THEN
    UPDATE entregadores
    SET 
      total_entregas = total_entregas + 1,
      saldo_carteira = saldo_carteira + NEW.taxa_entrega
    WHERE entregadores.usuario_id = NEW.entregador_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger para entregas do entregador
CREATE TRIGGER trigger_entregas_entregador
AFTER UPDATE ON pedidos
FOR EACH ROW
WHEN (NEW.status = 'entregue' AND OLD.status != 'entregue')
EXECUTE FUNCTION atualizar_entregas_entregador();

-- Verificar se os triggers foram criados
SELECT tgname, tgrelid::regclass, tgenabled
FROM pg_trigger
WHERE tgrelid = 'pedidos'::regclass
AND tgname LIKE 'trigger_%';

-- ============================================
-- FIM DO FIX
-- ============================================
