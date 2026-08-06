-- CreateTable
CREATE TABLE "WhatsappContato" (
    "id" TEXT NOT NULL,
    "nome" TEXT,
    "telefone" TEXT NOT NULL,
    "foto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappContato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappConversa" (
    "id" TEXT NOT NULL,
    "contatoId" TEXT NOT NULL,
    "ultimaMensagem" TEXT,
    "ultimaData" TIMESTAMP(3),
    "naoLidas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappConversa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappMensagem" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "mensagemIdMeta" TEXT,
    "texto" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT,
    "enviadaPorIA" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsappMensagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappContato_telefone_key" ON "WhatsappContato"("telefone");

-- AddForeignKey
ALTER TABLE "WhatsappConversa" ADD CONSTRAINT "WhatsappConversa_contatoId_fkey" FOREIGN KEY ("contatoId") REFERENCES "WhatsappContato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsappMensagem" ADD CONSTRAINT "WhatsappMensagem_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "WhatsappConversa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
