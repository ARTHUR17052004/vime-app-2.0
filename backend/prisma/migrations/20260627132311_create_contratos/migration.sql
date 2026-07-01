-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "locadorId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "kitnetId" TEXT NOT NULL,
    "inquilinoId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "valorAluguel" DOUBLE PRECISION NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "tipoGarantia" TEXT,
    "valorCaucao" DOUBLE PRECISION,
    "indiceReajuste" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_locadorId_fkey" FOREIGN KEY ("locadorId") REFERENCES "Locador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_kitnetId_fkey" FOREIGN KEY ("kitnetId") REFERENCES "Kitnet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Inquilino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
