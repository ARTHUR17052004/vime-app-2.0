-- Suporte ao envio de contrato via Clicksign API v3 (Envelopes + Modelo),
-- com demonstrativo antes do envio (em vez de envio automático).
ALTER TABLE "Configuracao" ADD COLUMN "clicksignTemplateKey" TEXT;

ALTER TABLE "Contrato" ADD COLUMN "clicksignEnvelopeId" TEXT;
ALTER TABLE "Contrato" ADD COLUMN "clicksignEnviadoEm" TIMESTAMP(3);
