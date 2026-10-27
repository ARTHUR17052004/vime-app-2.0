-- CreateTable
CREATE TABLE "SabadoConversa" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SabadoConversa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SabadoMensagem" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SabadoMensagem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SabadoConversa" ADD CONSTRAINT "SabadoConversa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SabadoMensagem" ADD CONSTRAINT "SabadoMensagem_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "SabadoConversa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
