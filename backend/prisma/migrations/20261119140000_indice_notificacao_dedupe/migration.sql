-- A trava de duplicata em notificacaoService.criar() (título+mensagem+
-- link+destinatário repetido dentro de 24h = ignora) filtra por
-- título+createdAt antes de comparar o resto -- sem índice, isso varria
-- a tabela "Notificacao" inteira a cada notificação criada no sistema
-- inteiro (Asaas, BB, Efí, WhatsApp, jobs...).
CREATE INDEX IF NOT EXISTS "Notificacao_titulo_createdAt_idx" ON "Notificacao"("titulo", "createdAt");
