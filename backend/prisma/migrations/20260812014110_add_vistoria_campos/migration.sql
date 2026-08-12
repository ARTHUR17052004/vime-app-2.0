-- AlterTable
ALTER TABLE "Vistoria" ADD COLUMN     "categoria" TEXT,
ADD COLUMN     "checklist" JSONB,
ADD COLUMN     "criticidade" TEXT,
ADD COLUMN     "dataProxima" TIMESTAMP(3),
ADD COLUMN     "dataUltima" TIMESTAMP(3),
ADD COLUMN     "fotos" JSONB,
ADD COLUMN     "kitnet" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "periodicidade" TEXT,
ADD COLUMN     "responsavel" TEXT,
ADD COLUMN     "unidade" TEXT;
