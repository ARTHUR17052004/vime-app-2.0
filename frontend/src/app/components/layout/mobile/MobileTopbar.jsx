/* eslint-disable @next/next/no-img-element */
"use client";

import NotificationBell from "../../notificacoes/NotificationBell";

export default function MobileTopbar() {
  return (
    <header
      className="
        sticky
        top-0
        z-30

        h-16

        border-b
        border-[var(--border-token)]

        bg-[var(--surface)]

        backdrop-blur-2xl

        px-4

        flex
        items-center
        justify-between
      "
    >
      <div className="flex items-center gap-2.5">
        <img
          src="/images/logo-vime.jpeg"
          alt="VIME"
          className="w-8 h-8 object-contain rounded-lg"
          draggable={false}
        />

        <h1 className="text-[17px] font-bold text-[var(--text)]">
          VIME
        </h1>
      </div>

      <div className="flex items-center">
        <NotificationBell />
      </div>
    </header>
  );
}
