-- CreateTable
CREATE TABLE "NotificacaoConfig" (
    "tipo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "push" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificacaoConfig_pkey" PRIMARY KEY ("tipo")
);
