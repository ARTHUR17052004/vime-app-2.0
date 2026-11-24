-- Aprovação de Solicitação (Sim/Não via WhatsApp ou no app).
ALTER TABLE "Solicitacao"
  ADD COLUMN "aprovacaoStatus" TEXT NOT NULL DEFAULT 'AGUARDANDO',
  ADD COLUMN "aprovacaoEm" TIMESTAMP(3),
  ADD COLUMN "aprovacaoPor" TEXT;

CREATE INDEX "Solicitacao_aprovacaoStatus_idx" ON "Solicitacao"("aprovacaoStatus");
