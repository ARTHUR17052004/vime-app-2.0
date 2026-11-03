-- AlterTable
ALTER TABLE "ContaPagamento" ADD COLUMN     "locadorId" TEXT;

-- AlterTable
ALTER TABLE "Kitnet" ADD COLUMN     "contaPagamentoId" TEXT;

-- AddForeignKey
ALTER TABLE "Kitnet" ADD CONSTRAINT "Kitnet_contaPagamentoId_fkey" FOREIGN KEY ("contaPagamentoId") REFERENCES "ContaPagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagamento" ADD CONSTRAINT "ContaPagamento_locadorId_fkey" FOREIGN KEY ("locadorId") REFERENCES "Locador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
