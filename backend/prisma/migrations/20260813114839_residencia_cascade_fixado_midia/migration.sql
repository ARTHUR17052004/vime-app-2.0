/*
  Warnings:

  - You are about to drop the column `kitnet` on the `Vistoria` table. All the data in the column will be lost.
  - You are about to drop the column `unidade` on the `Vistoria` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contrato" DROP CONSTRAINT "Contrato_inquilinoId_fkey";

-- DropForeignKey
ALTER TABLE "Contrato" DROP CONSTRAINT "Contrato_kitnetId_fkey";

-- DropForeignKey
ALTER TABLE "Contrato" DROP CONSTRAINT "Contrato_locadorId_fkey";

-- DropForeignKey
ALTER TABLE "Contrato" DROP CONSTRAINT "Contrato_unidadeId_fkey";

-- DropForeignKey
ALTER TABLE "Inquilino" DROP CONSTRAINT "Inquilino_kitnetId_fkey";

-- DropForeignKey
ALTER TABLE "Kitnet" DROP CONSTRAINT "Kitnet_unidadeId_fkey";

-- DropForeignKey
ALTER TABLE "Ocorrencia" DROP CONSTRAINT "Ocorrencia_vistoriaId_fkey";

-- AlterTable
ALTER TABLE "Despesa" ADD COLUMN     "fixado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unidadeId" TEXT;

-- AlterTable
ALTER TABLE "Receita" ADD COLUMN     "fixado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vistoria" DROP COLUMN "kitnet",
DROP COLUMN "unidade",
ADD COLUMN     "concluidaEm" TIMESTAMP(3),
ADD COLUMN     "fixado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fotosConclusao" JSONB,
ADD COLUMN     "kitnetId" TEXT,
ADD COLUMN     "unidadeId" TEXT;

-- AddForeignKey
ALTER TABLE "Kitnet" ADD CONSTRAINT "Kitnet_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquilino" ADD CONSTRAINT "Inquilino_kitnetId_fkey" FOREIGN KEY ("kitnetId") REFERENCES "Kitnet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Inquilino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_kitnetId_fkey" FOREIGN KEY ("kitnetId") REFERENCES "Kitnet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_locadorId_fkey" FOREIGN KEY ("locadorId") REFERENCES "Locador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Despesa" ADD CONSTRAINT "Despesa_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_kitnetId_fkey" FOREIGN KEY ("kitnetId") REFERENCES "Kitnet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ocorrencia" ADD CONSTRAINT "Ocorrencia_vistoriaId_fkey" FOREIGN KEY ("vistoriaId") REFERENCES "Vistoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
