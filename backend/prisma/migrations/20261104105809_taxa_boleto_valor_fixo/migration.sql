-- Rename: a taxa de boleto deixou de ser percentual e passou a ser um valor fixo em R$ (mesmos numeros ja cadastrados, so muda o que eles significam)
ALTER TABLE "ContaPagamento" RENAME COLUMN "taxaBoletoPercentual" TO "taxaBoletoValor";
