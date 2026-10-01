-- AlterTable
ALTER TABLE "Contrato" ADD COLUMN "origem" TEXT NOT NULL DEFAULT 'DIGITAL';
ALTER TABLE "Contrato" ADD COLUMN "arquivoDados" TEXT;
ALTER TABLE "Contrato" ADD COLUMN "arquivoTipo" TEXT;
ALTER TABLE "Contrato" ADD COLUMN "arquivoNomeOriginal" TEXT;
