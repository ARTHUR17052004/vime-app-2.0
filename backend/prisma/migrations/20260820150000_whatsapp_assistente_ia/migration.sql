-- Assistente IA (Claude) por WhatsApp: liga/desliga e chave da API,
-- guardados junto da config do WhatsApp por serem específicos dessa
-- conexão.
ALTER TABLE "ConfiguracaoWhatsapp" ADD COLUMN "iaAtivo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ConfiguracaoWhatsapp" ADD COLUMN "iaApiKey" TEXT;
