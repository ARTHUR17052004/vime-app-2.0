-- AlterTable
ALTER TABLE "Receita" ADD COLUMN "inquilinoId" TEXT;

-- AddForeignKey
ALTER TABLE "Receita" ADD CONSTRAINT "Receita_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Inquilino"("id") ON DELETE SET NULL ON UPDATE CASCADE;
