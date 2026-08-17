"use client";

import { useRouter } from "next/navigation";

import {
  Shield,
  DatabaseBackup,
  Mail,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

const opcoes = [
  {
    titulo: "Segurança",
    descricao: "Permissões, senhas e autenticação.",
    status: "Ver seção",
    icon: Shield,
    color: "text-emerald-400",
    alvo: "secao-seguranca",
  },
  {
    titulo: "Backup",
    descricao: "Gerencie cópias de segurança.",
    status: "Ver seção",
    icon: DatabaseBackup,
    color: "text-cyan-400",
    alvo: "secao-backup",
  },
  {
    titulo: "SMTP",
    descricao: "Servidor de envio de e-mails.",
    status: "Configurar",
    icon: Mail,
    color: "text-yellow-400",
    alvo: "secao-smtp",
  },
  {
    titulo: "Auditoria",
    descricao: "Histórico de alterações.",
    status: "Visualizar",
    icon: ClipboardList,
    color: "text-purple-400",
    rota: "/administracao/auditoria",
  },
];

export default function PainelRapido() {

  const router = useRouter();

  function acessar(item) {

    if (item.rota) {
      router.push(item.rota);
      return;
    }

    document
      .getElementById(item.alvo)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  }

  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl shadow-xl p-6">

      <div className="mb-6">

        <h2 className="text-xl font-semibold text-[var(--text)]">

          Acesso Rápido

        </h2>

        <p className="text-[var(--text-subtle)] text-sm mt-1">

          Principais configurações do sistema.

        </p>

      </div>

      <div className="space-y-4">

        {opcoes.map((item) => {

          const Icon = item.icon;

          return (

            <button
              key={item.titulo}
              onClick={() => acessar(item)}
              className="w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] hover:border-emerald-500/30 hover:-translate-y-1 transition-all p-5 text-left"
            >

              <div className="flex justify-between items-center">

                <div className="flex gap-4 items-center">

                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">

                    <Icon
                      size={24}
                      className={item.color}
                    />

                  </div>

                  <div>

                    <h3 className="text-[var(--text)] font-semibold">

                      {item.titulo}

                    </h3>

                    <p className="text-sm text-[var(--text-subtle)]">

                      {item.descricao}

                    </p>

                  </div>

                </div>

                <ArrowRight
                  size={18}
                  className="text-[var(--text-faint)]"
                />

              </div>

              <div className="mt-4">

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">

                  {item.status}

                </span>

              </div>

            </button>

          );

        })}

      </div>

    </div>
  );
}
