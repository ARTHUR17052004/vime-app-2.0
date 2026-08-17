"use client";

import {
  Bell,
  MessageCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";

const cards = [
  {
    titulo: "Notificações",
    valor: "248",
    icone: Bell,
  },
  {
    titulo: "WhatsApp",
    valor: "112",
    icone: MessageCircle,
  },
  {
    titulo: "E-mails",
    valor: "96",
    icone: Mail,
  },
  {
    titulo: "Sistema",
    valor: "Online",
    icone: ShieldCheck,
  },
];

export default function DashboardCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icone;

        return (
          <div
            key={index}
            className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  {card.titulo}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[var(--text)]">
                  {card.valor}
                </h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <Icon
                  size={30}
                  className="text-emerald-400"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}