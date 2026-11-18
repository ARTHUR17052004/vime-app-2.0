-- Escalada do corte de água/energia (Vistorias <-> Financeiro) + classificação
-- final de inadimplência. Tudo aditivo/opcional -- `status` da Receita
-- continua ATRASADA por baixo em todo o processo, pra não sumir da
-- cobrança automática (Asaas/BB/Efí), do lembrete de WhatsApp, do
-- Dashboard/Insights nem dos relatórios de inadimplência. Esses campos
-- novos só controlam o estágio (corte -> esvaziar kitnet -> aguardando
-- classificação) e os selos visuais no Financeiro.

-- Quando a vistoria de corte foi marcada Realizada -- começa a contar
-- as 72h pra escalar pra "esvaziar kitnet" se a cobrança continuar sem
-- resolver.
ALTER TABLE "Receita" ADD COLUMN "corteRealizadoEm" TIMESTAMP(3);

-- Mesma ideia de vistoriaCorteAtrasoCriadaEm/vistoriaCorteId, pra
-- escalada seguinte.
ALTER TABLE "Receita" ADD COLUMN "vistoriaEsvaziarCriadaEm" TIMESTAMP(3);
ALTER TABLE "Receita" ADD COLUMN "vistoriaEsvaziarId" TEXT;

-- Quando a vistoria de "esvaziar kitnet" foi marcada Realizada -- nesse
-- momento o contrato já foi encerrado e a kitnet já foi liberada
-- sozinha. Começa a contar as 72h de "aguardando classificação de
-- inadimplência".
ALTER TABLE "Receita" ADD COLUMN "kitnetEsvaziadaEm" TIMESTAMP(3);

-- Classificação final de uma receita que virou inadimplência de
-- verdade (botão "Inadimplência" nos 3 pontinhos do Financeiro).
ALTER TABLE "Receita" ADD COLUMN "classificacaoInadimplencia" TEXT;
ALTER TABLE "Receita" ADD COLUMN "observacaoInadimplencia" TEXT;
ALTER TABLE "Receita" ADD COLUMN "classificadaInadimplenciaEm" TIMESTAMP(3);
ALTER TABLE "Receita" ADD COLUMN "classificadaInadimplenciaPor" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Receita_vistoriaEsvaziarId_key" ON "Receita"("vistoriaEsvaziarId");

-- AddForeignKey
ALTER TABLE "Receita" ADD CONSTRAINT "Receita_vistoriaEsvaziarId_fkey" FOREIGN KEY ("vistoriaEsvaziarId") REFERENCES "Vistoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
