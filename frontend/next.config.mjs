/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */

  // DESLIGADO de propósito (17/11/2026) -- é o que causou o site inteiro
  // cair em produção. A partir do Next.js 16.4, "next build" passou a
  // avisar sozinho quando acha que tem upgrade de segurança disponível,
  // e nesse deploy (via SSH, sem terminal interativo de verdade) esse
  // aviso TRAVOU o build inteiro ("Looking for coding agents... No
  // supported coding agent found.") -- nunca chegou a gerar o build de
  // produção. O script de deploy não conferia se o build deu certo antes
  // de reiniciar o PM2, reiniciou com o build velho/quebrado e o nginx
  // passou a devolver 502 Bad Gateway pro site inteiro.
  experimental: {
    agentUpgrade: false,
  },
};

export default nextConfig;
