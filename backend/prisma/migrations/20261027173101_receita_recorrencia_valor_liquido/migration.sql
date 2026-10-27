-- AlterTable
ALTER TABLE "Receita" ADD COLUMN     "recorrente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "valorLiquido" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ConfiguracaoFinanceiro" (
    "id" SERIAL NOT NULL,
    "taxaBoletoPercentual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoFinanceiro_pkey" PRIMARY KEY ("id")
);
