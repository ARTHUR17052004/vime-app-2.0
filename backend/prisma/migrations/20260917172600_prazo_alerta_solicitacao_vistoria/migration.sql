-- AlterTable
ALTER TABLE "Solicitacao" ADD COLUMN     "ultimoAlertaPrazoEm" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Vistoria" ADD COLUMN     "ultimoAlertaAtrasadaEm" TIMESTAMP(3);
