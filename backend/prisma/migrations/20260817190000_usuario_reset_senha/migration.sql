-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "resetSenhaToken" TEXT,
ADD COLUMN "resetSenhaExpiraEm" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_resetSenhaToken_key" ON "Usuario"("resetSenhaToken");
