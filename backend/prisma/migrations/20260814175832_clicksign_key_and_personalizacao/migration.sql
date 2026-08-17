-- AlterTable
ALTER TABLE "Configuracao" ADD COLUMN     "mensagemBoasVindas" TEXT,
ADD COLUMN     "nomeEmpresa" TEXT,
ADD COLUMN     "nomeSistema" TEXT,
ADD COLUMN     "textoLogin" TEXT,
ADD COLUMN     "textoRodape" TEXT;

-- AlterTable
ALTER TABLE "Contrato" ADD COLUMN     "clicksignDocumentKey" TEXT;
