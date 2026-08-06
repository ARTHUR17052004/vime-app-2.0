-- CreateTable
CREATE TABLE "ConfiguracaoWhatsapp" (
    "id" TEXT NOT NULL,
    "nomeConexao" TEXT NOT NULL DEFAULT 'VIME 2.0',
    "numero" TEXT,
    "token" TEXT,
    "apiUrl" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'META',
    "conectado" BOOLEAN NOT NULL DEFAULT false,
    "qrCode" TEXT,
    "webhook" TEXT,
    "ultimaSincronizacao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoWhatsapp_pkey" PRIMARY KEY ("id")
);
