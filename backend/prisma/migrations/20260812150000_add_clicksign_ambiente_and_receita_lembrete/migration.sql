-- AlterTable
ALTER TABLE "Configuracao" ADD COLUMN     "clicksignAmbiente" TEXT DEFAULT 'sandbox';

-- AlterTable
ALTER TABLE "Receita" ADD COLUMN     "lembreteEnviadoEm" TIMESTAMP(3);
