-- Nenhuma tabela do sistema tinha índice em coluna nenhuma usada pra
-- filtrar (status, datas de vencimento/pagamento) nem nas chaves
-- estrangeiras (contratoId, unidadeId, locadorId...) -- toda consulta
-- por status/período/locador varria a tabela inteira. É o que deixa o
-- VIME Insights (e as listagens de Financeiro/Contratos/Kitnets/
-- Solicitações/Vistorias, que filtram pelas mesmas colunas) lento
-- conforme o volume de dados cresce. IF NOT EXISTS: seguro de rodar
-- de novo, não trava nem perde dado.

-- Receita (Financeiro + "recebido/previsto/vencidas/a vencer" do Insights)
CREATE INDEX IF NOT EXISTS "Receita_status_idx" ON "Receita"("status");
CREATE INDEX IF NOT EXISTS "Receita_vencimento_idx" ON "Receita"("vencimento");
CREATE INDEX IF NOT EXISTS "Receita_dataPagamento_idx" ON "Receita"("dataPagamento");
CREATE INDEX IF NOT EXISTS "Receita_locadorId_idx" ON "Receita"("locadorId");
CREATE INDEX IF NOT EXISTS "Receita_contratoId_idx" ON "Receita"("contratoId");
CREATE INDEX IF NOT EXISTS "Receita_inquilinoId_idx" ON "Receita"("inquilinoId");

-- Contrato (Contratos + "vigentes/vencendo/pendentes/encerrados" do Insights)
CREATE INDEX IF NOT EXISTS "Contrato_status_idx" ON "Contrato"("status");
CREATE INDEX IF NOT EXISTS "Contrato_dataFim_idx" ON "Contrato"("dataFim");
CREATE INDEX IF NOT EXISTS "Contrato_locadorId_idx" ON "Contrato"("locadorId");

-- Kitnet (Kitnets + "ocupadas/vazias/taxa de ocupação" do Insights)
CREATE INDEX IF NOT EXISTS "Kitnet_status_idx" ON "Kitnet"("status");
CREATE INDEX IF NOT EXISTS "Kitnet_unidadeId_idx" ON "Kitnet"("unidadeId");

-- Unidade (escopo por locador em quase todo filtro acima)
CREATE INDEX IF NOT EXISTS "Unidade_locadorId_idx" ON "Unidade"("locadorId");

-- Solicitacao (abertas/atrasadas do Insights)
CREATE INDEX IF NOT EXISTS "Solicitacao_status_idx" ON "Solicitacao"("status");
CREATE INDEX IF NOT EXISTS "Solicitacao_prazo_idx" ON "Solicitacao"("prazo");
CREATE INDEX IF NOT EXISTS "Solicitacao_locadorId_idx" ON "Solicitacao"("locadorId");
CREATE INDEX IF NOT EXISTS "Solicitacao_criadoPorId_idx" ON "Solicitacao"("criadoPorId");

-- Vistoria (agendadas/pendentes/atrasadas/realizadas hoje do Insights)
CREATE INDEX IF NOT EXISTS "Vistoria_status_idx" ON "Vistoria"("status");
CREATE INDEX IF NOT EXISTS "Vistoria_concluidaEm_idx" ON "Vistoria"("concluidaEm");
CREATE INDEX IF NOT EXISTS "Vistoria_unidadeId_idx" ON "Vistoria"("unidadeId");
CREATE INDEX IF NOT EXISTS "Vistoria_kitnetId_idx" ON "Vistoria"("kitnetId");

-- VistoriaMissao (missões "Geral" realizadas hoje) e Ocorrencia (total por vistoria)
CREATE INDEX IF NOT EXISTS "VistoriaMissao_dataRealizacao_idx" ON "VistoriaMissao"("dataRealizacao");
CREATE INDEX IF NOT EXISTS "Ocorrencia_vistoriaId_idx" ON "Ocorrencia"("vistoriaId");
