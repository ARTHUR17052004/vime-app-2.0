-- CreateTable
CREATE TABLE "CredencialBiometria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transports" TEXT,
    "nome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CredencialBiometria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CredencialBiometria_credentialId_key" ON "CredencialBiometria"("credentialId");

-- CreateIndex
CREATE INDEX "CredencialBiometria_usuarioId_idx" ON "CredencialBiometria"("usuarioId");

-- AddForeignKey
ALTER TABLE "CredencialBiometria" ADD CONSTRAINT "CredencialBiometria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
