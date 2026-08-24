-- Modo manutenção: desativa o sistema pra todo mundo exceto o
-- Administrador, ligado/desligado a qualquer momento pela própria
-- conta do admin.
ALTER TABLE "Configuracao" ADD COLUMN "manutencaoAtiva" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Configuracao" ADD COLUMN "manutencaoMensagem" TEXT;
