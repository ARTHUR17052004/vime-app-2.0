-- DropForeignKey
ALTER TABLE "Vistoria" DROP CONSTRAINT "Vistoria_kitnetId_fkey";

-- DropForeignKey
ALTER TABLE "Vistoria" DROP CONSTRAINT "Vistoria_unidadeId_fkey";

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_kitnetId_fkey" FOREIGN KEY ("kitnetId") REFERENCES "Kitnet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
