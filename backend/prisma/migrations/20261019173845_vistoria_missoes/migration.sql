-- AlterTable
ALTER TABLE "Vistoria" ADD COLUMN     "cicloAtual" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "VistoriaMissao" (
    "id" TEXT NOT NULL,
    "vistoriaId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "ciclo" INTEGER NOT NULL,
    "dataRealizacao" TIMESTAMP(3) NOT NULL,
    "realizadoPor" TEXT,
    "fotos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VistoriaMissao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VistoriaMissao_vistoriaId_unidadeId_ciclo_key" ON "VistoriaMissao"("vistoriaId", "unidadeId", "ciclo");

-- AddForeignKey
ALTER TABLE "VistoriaMissao" ADD CONSTRAINT "VistoriaMissao_vistoriaId_fkey" FOREIGN KEY ("vistoriaId") REFERENCES "Vistoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VistoriaMissao" ADD CONSTRAINT "VistoriaMissao_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
