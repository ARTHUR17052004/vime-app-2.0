-- A migração anterior (solicitacao_aprovacao) deu DEFAULT 'AGUARDANDO'
-- pra coluna nova em TODA solicitação já existente -- certo pra quem
-- for criada daqui pra frente (webhook/app realmente precisa aprovar),
-- errado pra quem já existia antes dessa funcionalidade existir (bug
-- encontrado testando em 24/11/2026: o teste de ponta a ponta usou a
-- fila "mais antiga ainda AGUARDANDO" e pegou uma solicitação REAL,
-- "TINTA PARA VIME I" / SOL-729941, rejeitando ela sem querer -- já
-- revertida manualmente pro estado original antes dessa migração).
-- Grandfather: quem nunca passou pelo fluxo novo (aprovacaoEm/aprovacaoPor
-- ainda nulos) já conta como aprovada.
UPDATE "Solicitacao"
SET "aprovacaoStatus" = 'APROVADA'
WHERE "aprovacaoEm" IS NULL AND "aprovacaoPor" IS NULL;
