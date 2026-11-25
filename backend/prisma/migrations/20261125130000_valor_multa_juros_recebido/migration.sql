-- Valor real (R$) de multa/juros recebido pelo provedor de pagamento,
-- diferente de multaValor/jurosValor (que são só a taxa % configurada).
-- Null = não confirmado pelo provedor ainda -- relatório cai pro
-- cálculo estimado (taxa x dias de atraso).
ALTER TABLE "Receita" ADD COLUMN "valorMultaRecebida" DOUBLE PRECISION;
ALTER TABLE "Receita" ADD COLUMN "valorJurosRecebido" DOUBLE PRECISION;
