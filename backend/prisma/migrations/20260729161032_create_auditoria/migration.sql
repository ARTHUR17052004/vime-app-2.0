-- CreateTable
CREATE TABLE "Auditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "usuarioNome" TEXT,
    "modulo" TEXT NOT NULL,
    "registroId" TEXT,
    "acao" TEXT NOT NULL,
    "valorAnterior" JSONB,
    "valorNovo" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);
