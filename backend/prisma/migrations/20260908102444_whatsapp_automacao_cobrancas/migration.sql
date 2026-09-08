-- AlterTable
ALTER TABLE "Receita" ADD COLUMN     "avisoVencidoEnviadoEm" TIMESTAMP(3),
ADD COLUMN     "confirmacaoPagtoEnviadaEm" TIMESTAMP(3),
ADD COLUMN     "linkBoleto" TEXT;

-- AlterTable
ALTER TABLE "WhatsappContato" ADD COLUMN     "inquilinoId" TEXT;

-- AddForeignKey
ALTER TABLE "WhatsappContato" ADD CONSTRAINT "WhatsappContato_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "Inquilino"("id") ON DELETE SET NULL ON UPDATE CASCADE;
