-- Etapa do meio da escalada de corte de água/energia: "FECHAR PORTA
-- COM GRADE" (entre o corte já realizado e a desocupação do imóvel).
ALTER TABLE "Receita"
  ADD COLUMN "vistoriaPortaCriadaEm" TIMESTAMP(3),
  ADD COLUMN "vistoriaPortaId" TEXT,
  ADD COLUMN "portaFechadaEm" TIMESTAMP(3);

CREATE UNIQUE INDEX "Receita_vistoriaPortaId_key" ON "Receita"("vistoriaPortaId");

ALTER TABLE "Receita"
  ADD CONSTRAINT "Receita_vistoriaPortaId_fkey"
  FOREIGN KEY ("vistoriaPortaId") REFERENCES "Vistoria"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
