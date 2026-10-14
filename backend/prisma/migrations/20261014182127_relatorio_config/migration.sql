-- CreateTable
CREATE TABLE "RelatorioConfig" (
    "tipo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelatorioConfig_pkey" PRIMARY KEY ("tipo")
);
