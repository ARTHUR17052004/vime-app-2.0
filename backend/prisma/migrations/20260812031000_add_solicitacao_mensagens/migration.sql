-- AlterTable
ALTER TABLE "Solicitacao" ADD COLUMN     "criadoPorId" TEXT,
ADD COLUMN     "criadoPorNome" TEXT;

-- CreateTable
CREATE TABLE "SolicitacaoMensagem" (
    "id" TEXT NOT NULL,
    "solicitacaoId" TEXT NOT NULL,
    "autorId" TEXT,
    "autorNome" TEXT NOT NULL,
    "texto" TEXT,
    "statusAlterado" TEXT,
    "anexoNome" TEXT,
    "anexoTipo" TEXT,
    "anexoDados" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitacaoMensagem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SolicitacaoMensagem" ADD CONSTRAINT "SolicitacaoMensagem_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "Solicitacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
