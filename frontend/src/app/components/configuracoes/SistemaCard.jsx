"use client";

import {
  Server,
  Database,
  Globe,
  HardDrive,
  Cpu,
  ShieldCheck,
} from "lucide-react";

import Card from "../ui/Card";

const itens = [
  {
    titulo: "Versão do Sistema",
    valor: "VIME APP 2.0",
    icon: Server,
    color: "text-emerald-400",
  },
  {
    titulo: "Ambiente",
    valor: "Produção",
    icon: Globe,
    color: "text-green-400",
  },
  {
    titulo: "Banco de Dados",
    valor: "PostgreSQL",
    icon: Database,
    color: "text-cyan-400",
  },
  {
    titulo: "Servidor",
    valor: "Online",
    icon: ShieldCheck,
    color: "text-lime-400",
  },
  {
    titulo: "Armazenamento",
    valor: "4.8 GB",
    icon: HardDrive,
    color: "text-yellow-400",
  },
  {
    titulo: "Uso de Memória",
    valor: "512 MB",
    icon: Cpu,
    color: "text-purple-400",
  },
];

export default function SistemaCard() {
  return (
    <Card className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-3 mb-8">

        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">

          <Server
            size={26}
            className="text-cyan-400"
          />

        </div>

        <div>

          <h2 className="text-xl font-semibold text-white">

            Sistema

          </h2>

          <p className="text-gray-400 text-sm">

            Informações gerais sobre o ambiente do VIME.

          </p>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {itens.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.titulo}
              className="rounded-2xl border border-white/10 bg-slate-800/60 p-5 hover:border-emerald-500/30 hover:-translate-y-1 transition-all"
            >

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-sm text-gray-400">

                    {item.titulo}

                  </p>

                  <h3 className="text-lg font-bold text-white mt-2">

                    {item.valor}

                  </h3>

                </div>

                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">

                  <Icon
                    size={24}
                    className={item.color}
                  />

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </Card>
  );
}