-- AlterTable
ALTER TABLE "Receita" ADD COLUMN     "asaasPaymentId" TEXT,
ADD COLUMN     "asaasCustomerId" TEXT,
ADD COLUMN     "enviadaAsaas" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Inquilino" ADD COLUMN     "asaasCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Receita_asaasPaymentId_key" ON "Receita"("asaasPaymentId");
