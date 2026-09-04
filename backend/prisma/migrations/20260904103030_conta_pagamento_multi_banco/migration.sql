-- AlterTable
ALTER TABLE "Locador" ADD COLUMN     "contaPagamentoId" TEXT;

-- AlterTable
ALTER TABLE "Receita" ADD COLUMN     "contaPagamentoId" TEXT,
ADD COLUMN     "gatewayProvider" TEXT,
ADD COLUMN     "gatewayReferencia" TEXT;

-- CreateTable
CREATE TABLE "ContaPagamento" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "credenciais" JSONB NOT NULL,
    "padrao" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContaPagamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Locador" ADD CONSTRAINT "Locador_contaPagamentoId_fkey" FOREIGN KEY ("contaPagamentoId") REFERENCES "ContaPagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receita" ADD CONSTRAINT "Receita_contaPagamentoId_fkey" FOREIGN KEY ("contaPagamentoId") REFERENCES "ContaPagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
