import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
    // Só pra "migrate deploy/dev" -- ver prisma/schema.prisma
    // (datasource.directUrl) pro motivo (P1002, advisory lock que não
    // funciona direito pela URL com pgbouncer=true). Esse arquivo
    // sobrepõe o datasource do schema.prisma pra quem roda via CLI
    // (é o aviso "Prisma config file... overrides" que aparece no
    // deploy), então precisa estar espelhado aqui também.
    directUrl: process.env.DIRECT_URL,
  },
});