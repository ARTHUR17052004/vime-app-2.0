-- Quando a cobranca foi de fato mandada pro banco/provedor (botao "Enviar Cobranca") -- usado no Mapa da Cobranca
ALTER TABLE "Receita" ADD COLUMN "cobrancaEnviadaEm" TIMESTAMP(3);
