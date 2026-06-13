-- CreateTable
CREATE TABLE "Inquilino" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "dataInicioContrato" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "kitnetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquilino_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Inquilino" ADD CONSTRAINT "Inquilino_kitnetId_fkey" FOREIGN KEY ("kitnetId") REFERENCES "Kitnet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
