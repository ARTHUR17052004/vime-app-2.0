-- Dia de vencimento próprio da kitnet (mesmo padrão de aluguel/
-- aluguelManual): nasce puxando da Residência, mas para de seguir
-- depois que é editado na própria kitnet.
ALTER TABLE "Kitnet"
  ADD COLUMN "diaVencimento" INTEGER,
  ADD COLUMN "diaVencimentoManual" BOOLEAN NOT NULL DEFAULT false;
