-- Signatários fixos: entram automaticamente em todo contrato novo enviado à Clicksign.
CREATE TABLE "SignatarioFixo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "authMode" TEXT NOT NULL DEFAULT 'email',
    "signAs" TEXT NOT NULL DEFAULT 'sign',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignatarioFixo_pkey" PRIMARY KEY ("id")
);
