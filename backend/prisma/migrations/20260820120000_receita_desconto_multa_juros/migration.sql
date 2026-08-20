-- Permite configurar desconto/multa/juros numa receita antes de
-- enviá-la ao Asaas (tela de Asaas Transações -> Editar).
ALTER TABLE "Receita" ADD COLUMN "descontoValor" DOUBLE PRECISION;
ALTER TABLE "Receita" ADD COLUMN "descontoDias" INTEGER;
ALTER TABLE "Receita" ADD COLUMN "multaValor" DOUBLE PRECISION;
ALTER TABLE "Receita" ADD COLUMN "jurosValor" DOUBLE PRECISION;
