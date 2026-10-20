-- AlterTable
ALTER TABLE "Notificacao" ADD COLUMN     "perfisAlvo" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "NotificacaoConfig" ADD COLUMN     "mensagemTemplate" TEXT,
ADD COLUMN     "perfis" TEXT[] DEFAULT ARRAY[]::TEXT[];
