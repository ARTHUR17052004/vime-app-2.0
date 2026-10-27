-- AlterTable
ALTER TABLE "ContaPagamento" ADD COLUMN     "taxaBoletoPercentual" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "ConfiguracaoFinanceiro";
