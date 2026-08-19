-- Guarda a forma de pagamento real usada ao enviar a cobrança ao Asaas
-- (o campo "Forma" na tela de Asaas Transações estava sempre mostrando
-- "PIX" fixo, mesmo quando a cobrança foi enviada como boleto).
ALTER TABLE "Receita" ADD COLUMN "formaPagamento" TEXT;
