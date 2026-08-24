-- Foto de perfil (guardada como data URL base64, redimensionada no
-- navegador antes do upload pra não pesar).
ALTER TABLE "Usuario" ADD COLUMN "foto" TEXT;
