-- CreateTable
CREATE TABLE "RelatorioAgendado" (
    "id" TEXT NOT NULL,
    "relatorioChave" TEXT NOT NULL,
    "relatorioTitulo" TEXT NOT NULL,
    "formato" TEXT NOT NULL,
    "destinatarioEmail" TEXT NOT NULL,
    "dataAgendada" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "enviadoEm" TIMESTAMP(3),
    "erro" TEXT,
    "criadoPorId" TEXT,
    "criadoPorNome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelatorioAgendado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RelatorioAgendado_status_idx" ON "RelatorioAgendado"("status");

-- CreateIndex
CREATE INDEX "RelatorioAgendado_dataAgendada_idx" ON "RelatorioAgendado"("dataAgendada");
