-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "locadorId" TEXT;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_locadorId_fkey" FOREIGN KEY ("locadorId") REFERENCES "Locador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
