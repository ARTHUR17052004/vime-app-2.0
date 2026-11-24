-- Dedução mensal (água + energia) por inquilino, usada no Relatório
-- de Receitas (Financeiro > Extratos > Exportar Excel). Null = usa o
-- padrão (Locador.taxaAdministracao) na hora de montar o relatório.
ALTER TABLE "Inquilino" ADD COLUMN "valorDeducao" DOUBLE PRECISION;
