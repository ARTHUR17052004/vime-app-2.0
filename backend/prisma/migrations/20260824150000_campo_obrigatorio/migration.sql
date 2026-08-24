-- Configuração de campos obrigatórios por módulo (tela em Administração).
CREATE TABLE "CampoObrigatorio" (
    "id" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampoObrigatorio_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CampoObrigatorio_modulo_campo_key" ON "CampoObrigatorio"("modulo", "campo");
