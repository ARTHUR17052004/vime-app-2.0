-- AlterTable
ALTER TABLE "Inquilino" ADD COLUMN     "contatoEmergencia" TEXT,
ADD COLUMN     "dataFimContrato" TIMESTAMP(3),
ADD COLUMN     "dataNascimento" TIMESTAMP(3),
ADD COLUMN     "enderecoAnterior" TEXT,
ADD COLUMN     "indiceReajuste" TEXT,
ADD COLUMN     "prazoContrato" INTEGER,
ADD COLUMN     "rg" TEXT,
ADD COLUMN     "telefoneEmergencia" TEXT,
ADD COLUMN     "tipoGarantia" TEXT,
ADD COLUMN     "valorCaucao" DOUBLE PRECISION;
