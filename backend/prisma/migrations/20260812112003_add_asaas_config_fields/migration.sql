-- AlterTable
ALTER TABLE "Configuracao" ADD COLUMN     "asaasAmbiente" TEXT DEFAULT 'sandbox',
ADD COLUMN     "asaasTaxaAdministracao" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "asaasWalletId" TEXT,
ADD COLUMN     "asaasWebhookToken" TEXT;
