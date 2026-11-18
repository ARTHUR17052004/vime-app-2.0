"use client";

import { useState } from "react";

import MobileTopbar from "./MobileTopbar";
import MobileBottomNav from "./MobileBottomNav";
import MobileMoreMenu from "./MobileMoreMenu";
import CommandPalette from "../CommandPalette";

export default function MobileShell({ children }) {
  const [maisAberto, setMaisAberto] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="
          fixed
          inset-0
          -z-20
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage: "url('/images/background.jpg')",
        }}
      />

      <div
        className="
          fixed
          inset-0
          -z-10
          bg-[var(--surface-inset)]
          backdrop-blur-sm
        "
      />

      {/* h-dvh (não h-screen/100vh) -- 100vh é fixo no tamanho MÁXIMO da
          tela e ignora a barra de endereço do navegador mobile aparecendo/
          sumindo; cada aparelho/navegador mostra essa barra de um jeito,
          então 100vh sobrava ou faltava espaço dependendo de qual. dvh
          acompanha a altura visível de verdade, ao vivo. */}
      <div className="flex flex-col h-dvh">
        <MobileTopbar />

        <main
          className="
            flex-1
            min-h-0

            overflow-y-auto

            pt-4
            pb-24
          "
          style={{
            paddingLeft: "max(1rem, env(safe-area-inset-left, 0px))",
            paddingRight: "max(1rem, env(safe-area-inset-right, 0px))",
          }}
        >
          {children}
        </main>

        <MobileBottomNav
          onAbrirMais={() => setMaisAberto(true)}
          maisAberto={maisAberto}
        />
      </div>

      <MobileMoreMenu aberto={maisAberto} onFechar={() => setMaisAberto(false)} />

      <CommandPalette />
    </div>
  );
}
