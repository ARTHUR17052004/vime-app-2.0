/*
  Warnings:

  - You are about to drop the column `usuario` on the `LogSistema` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LogSistema" DROP COLUMN "usuario",
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "usuarioId" TEXT,
ADD COLUMN     "usuarioNome" TEXT;
