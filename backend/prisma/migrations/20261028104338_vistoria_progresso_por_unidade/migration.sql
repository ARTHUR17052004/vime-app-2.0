-- AlterTable
ALTER TABLE "Vistoria" ADD COLUMN     "dataProximaBase" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "VistoriaProgresso" (
    "id" TEXT NOT NULL,
    "vistoriaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "cicloAtual" INTEGER NOT NULL DEFAULT 1,
    "dataUltima" TIMESTAMP(3),
    "dataProxima" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VistoriaProgresso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VistoriaProgresso_vistoriaId_unidadeId_key" ON "VistoriaProgresso"("vistoriaId", "unidadeId");

-- AddForeignKey
ALTER TABLE "VistoriaProgresso" ADD CONSTRAINT "VistoriaProgresso_vistoriaId_fkey" FOREIGN KEY ("vistoriaId") REFERENCES "Vistoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VistoriaProgresso" ADD CONSTRAINT "VistoriaProgresso_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
