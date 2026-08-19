-- Contratos agora nascem como "PENDENTE" (aguardando assinatura na
-- Clicksign) em vez de "ATIVO". O status só vira "ATIVO" quando o webhook
-- da Clicksign confirma que o documento foi assinado/fechado.
ALTER TABLE "Contrato" ALTER COLUMN "status" SET DEFAULT 'PENDENTE';
