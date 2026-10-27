-- CreateTable
CREATE TABLE "SnapshotOcupacao" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "locadorId" TEXT,
    "residenciasTotal" INTEGER NOT NULL,
    "kitnetsTotal" INTEGER NOT NULL,
    "kitnetsOcupadas" INTEGER NOT NULL,
    "taxaOcupacao" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SnapshotOcupacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SnapshotOcupacao_data_locadorId_key" ON "SnapshotOcupacao"("data", "locadorId");
