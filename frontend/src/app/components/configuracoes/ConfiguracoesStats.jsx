"use client";

import {
    Building2,
    Database,
    ShieldCheck,
    Clock3
} from "lucide-react";

const stats = [
    {
        titulo: "Empresa",
        valor: "Configurada",
        icone: Building2,
        cor: "emerald",
    },
    {
        titulo: "Sistema",
        valor: "Online",
        icone: ShieldCheck,
        cor: "green",
    },
    {
        titulo: "Banco",
        valor: "Conectado",
        icone: Database,
        cor: "cyan",
    },
    {
        titulo: "Última Alteração",
        valor: "Hoje",
        icone: Clock3,
        cor: "amber",
    },
];

export default function ConfiguracoesStats() {
    return (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {stats.map((item) => {

                const Icon = item.icone;

                return (

                    <div
                        key={item.titulo}
                        className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl shadow-xl p-6 hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-2xl transition-all"
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-[var(--text-subtle)] text-sm">

                                    {item.titulo}

                                </p>

                                <h2 className="text-2xl font-bold text-[var(--text)] mt-2">

                                    {item.valor}

                                </h2>

                            </div>

                            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 flex items-center justify-center">

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