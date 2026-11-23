-- Feriados ADICIONAIS aos nacionais (esses últimos são calculados
-- sozinhos, ver backend/src/utils/diaUtil.js) -- pensado pro feriado
-- estadual (ex.: Dia do Servidor Público de Goiás, deslocável por
-- decreto todo ano) e qualquer outro dia pontual que o admin queira
-- tratar como não-útil. Usado pelos relógios de vencimento/atraso/
-- corte de água/esvaziar kitnet (pedido do usuário em 23/11/2026).
CREATE TABLE "Feriado" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feriado_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Feriado_data_key" ON "Feriado"("data");
