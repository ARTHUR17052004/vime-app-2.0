-- CreateTable
CREATE TABLE "Configuracao" (
    "id" SERIAL NOT NULL,
    "empresa" TEXT NOT NULL,
    "cnpj" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "logo" TEXT,
    "tema" TEXT DEFAULT 'claro',
    "corPrimaria" TEXT DEFAULT '#F4C430',
    "corSecundaria" TEXT DEFAULT '#1F2937',
    "smtpHost" TEXT,
    "smtpPorta" INTEGER,
    "smtpUsuario" TEXT,
    "smtpSenha" TEXT,
    "asaasToken" TEXT,
    "clicksignToken" TEXT,
    "whatsappToken" TEXT,
    "whatsappNumero" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);
