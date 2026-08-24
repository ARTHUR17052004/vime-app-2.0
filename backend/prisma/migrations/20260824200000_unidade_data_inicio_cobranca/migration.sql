-- Data a partir da qual a cobrança recorrente automática (job diário)
-- passa a valer para os contratos desta residência. Nula = sempre valeu
-- (comportamento anterior, sem trava).
ALTER TABLE "Unidade" ADD COLUMN "dataInicioCobranca" TIMESTAMP(3);
