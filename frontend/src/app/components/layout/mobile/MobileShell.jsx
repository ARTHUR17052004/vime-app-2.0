"use client";

import { useState } from "react";

import MobileTopbar from "./MobileTopbar";
import MobileBottomNav from "./MobileBottomNav";
import MobileMoreMenu from "./MobileMoreMenu";

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

      <div className="flex flex-col min-h-screen">
        <MobileTopbar />

        <main
          className="
            flex-1

            px-4
            pt-4
            pb-24
          "
        >
          {children}
        </main>

        <MobileBottomNav
          onAbrirMais={() => setMaisAberto(true)}
          maisAberto={maisAberto}
        />
      </div>

      <MobileMoreMenu aberto={maisAberto} onFechar={() => setMaisAberto(false)} />
    </div>
  );
}
