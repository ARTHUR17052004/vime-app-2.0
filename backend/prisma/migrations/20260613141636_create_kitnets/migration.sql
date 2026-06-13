-- CreateTable
CREATE TABLE "Kitnet" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "metragem" DOUBLE PRECISION NOT NULL,
    "valorAluguel" DOUBLE PRECISION NOT NULL,
    "ocupada" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "unidadeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kitnet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Kitnet" ADD CONSTRAINT "Kitnet_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
