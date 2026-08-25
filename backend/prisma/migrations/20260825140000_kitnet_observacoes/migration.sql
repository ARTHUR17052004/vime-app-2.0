-- A coluna nunca existiu, mas o formulário de Kitnet sempre enviou "observacoes",
-- quebrando toda criação/edição de kitnet com "Unknown argument observacoes".
ALTER TABLE "Kitnet" ADD COLUMN "observacoes" TEXT;
