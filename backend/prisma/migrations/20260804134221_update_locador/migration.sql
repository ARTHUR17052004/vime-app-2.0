-- AlterTable
ALTER TABLE "Locador" ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "pix" TEXT,
ADD COLUMN     "tipoPessoa" TEXT NOT NULL DEFAULT 'PF';
