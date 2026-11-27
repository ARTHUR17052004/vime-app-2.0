-- Guarda o arquivo (PDF/Excel) de verdade que foi enviado, pra permitir
-- baixar depois sem gerar de novo, e marca agendamentos recorrentes
-- (repete todo mês).
ALTER TABLE "RelatorioAgendado"
  ADD COLUMN "arquivoDados" TEXT,
  ADD COLUMN "arquivoNomeOriginal" TEXT,
  ADD COLUMN "arquivoMimeType" TEXT,
  ADD COLUMN "recorrente" BOOLEAN NOT NULL DEFAULT false;
