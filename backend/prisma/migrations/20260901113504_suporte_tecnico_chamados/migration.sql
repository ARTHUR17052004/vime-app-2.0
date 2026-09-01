-- CreateTable
CREATE TABLE "Chamado" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT,
    "criticidade" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "criadoPorId" TEXT,
    "criadoPorNome" TEXT,
    "criadoPorPerfil" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chamado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChamadoMensagem" (
    "id" TEXT NOT NULL,
    "chamadoId" TEXT NOT NULL,
    "autorId" TEXT,
    "autorNome" TEXT NOT NULL,
    "texto" TEXT,
    "statusAlterado" TEXT,
    "anexoNome" TEXT,
    "anexoTipo" TEXT,
    "anexoDados" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChamadoMensagem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChamadoMensagem" ADD CONSTRAINT "ChamadoMensagem_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "Chamado"("id") ON DELETE CASCADE ON UPDATE CASCADE;
