-- AlterTable
ALTER TABLE "Unidade" ADD COLUMN     "aluguel" DOUBLE PRECISION,
ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "locadorId" TEXT,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "vencimento" INTEGER,
ALTER COLUMN "locador" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Locador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "cpfCnpj" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "banco" TEXT,
    "agencia" TEXT,
    "conta" TEXT,
    "taxaAdministracao" DOUBLE PRECISION DEFAULT 0,
    "multa" DOUBLE PRECISION DEFAULT 0,
    "juros" DOUBLE PRECISION DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Locador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Locador_email_key" ON "Locador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Locador_cpfCnpj_key" ON "Locador"("cpfCnpj");

-- AddForeignKey
ALTER TABLE "Unidade" ADD CONSTRAINT "Unidade_locadorId_fkey" FOREIGN KEY ("locadorId") REFERENCES "Locador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
