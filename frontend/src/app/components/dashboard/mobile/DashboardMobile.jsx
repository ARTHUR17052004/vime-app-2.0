"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  ChevronRight,
  ClipboardList,
  ClipboardPlus,
  DollarSign,
  FileText,
  House,
  LayoutDashboard,
  TriangleAlert,
  User,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import { useNotificacoes } from "../../../../hooks/useNotificacoes";
import { useClima } from "../../../../hooks/useClima";

// Home do celular -- mesma organização do modelo aprovado: saudação,
// ações rápidas, indicadores, ocupação, notificações e acesso rápido.
// O desktop continua usando o dashboard de sempre (ver app/page.js).

const cartao = `
  rounded-2xl
  border
  border-[var(--border-token)]
  bg-[var(--surface)]
  backdrop-blur-xl
`;

// "ARTHUR " no cadastro vira "Arthur" na saudação.
function nomeProprio(nome) {
  return (nome || "").toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function dataExtensa() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatarTempo(data) {
  const minutos = Math.floor((Date.now() - new Date(data).getTime()) / 60000);

  if (minutos < 1) return "agora mesmo";
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;

  return `há ${Math.floor(horas / 24)} d`;
}

// Ícone e cor do ponto seguem o assunto da notificação, não só a origem.
function aparenciaNotificacao(n) {

  const texto = `${n.titulo} ${n.mensagem}`.toLowerCase();
  const link = n.link || "";

  let Icone = Bell;
  if (link.startsWith("/kitnets")) Icone = House;
  else if (link.startsWith("/contratos")) Icone = FileText;
  else if (link.startsWith("/solicitacoes") || link.startsWith("/vistorias")) Icone = ClipboardList;
  else if (n.origem === "ASAAS" || link.startsWith("/financeiro")) Icone = DollarSign;

  let ponto = "bg-[var(--text-faint)]";
  if (/vazia|vencido|atrasad|inadimpl/.test(texto)) ponto = "bg-red-500";
  else if (/vence|vencimento|pr[óo]xim/.test(texto)) ponto = "bg-amber-400";
  else if (n.origem === "ASAAS" || /confirmad|pago|recebid/.test(texto)) ponto = "bg-emerald-400";

  return { Icone, ponto };

}

function percentualOcupacao(ocupacao) {
  if (typeof ocupacao === "number") return ocupacao;
  return ocupacao?.percentual ?? 0;
}

function percentualRecebido(financeiro) {

  const recebido = financeiro?.recebido ?? 0;
  const total = recebido + (financeiro?.pendente ?? 0) + (financeiro?.atrasado ?? 0);

  if (total <= 0) return null;

  return Math.round((recebido / total) * 100);

}

export default function DashboardMobile({ dados, primeiroNome }) {

  const router = useRouter();
  const clima = useClima();
  const { naoLidas, marcarComoLida } = useNotificacoes();

  const percentual = percentualOcupacao(dados?.ocupacao);
  const ocupadas = dados?.ocupacao?.ocupadas ?? 0;
  const vazias = dados?.ocupacao?.vazias ?? 0;
  const recebido = percentualRecebido(dados?.financeiro);

  const acoesRapidas = [
    { titulo: "Novo Inquilino", icone: UserPlus, href: "/inquilinos" },
    { titulo: "Nova Unidade", icone: Building2, href: "/unidades" },
    { titulo: "Lançar Recebimento", icone: DollarSign, href: "/financeiro" },
    { titulo: "Nova Solicitação", icone: ClipboardPlus, href: "/solicitacoes" },
  ];

  const indicadores = [
    { titulo: "Residências", valor: dados?.unidades ?? 0, sub: "Cadastradas", icone: Building2, cor: "text-emerald-400 bg-emerald-500/15" },
    { titulo: "Inquilinos", valor: dados?.inquilinos ?? 0, sub: "Ativos", icone: Users, cor: "text-sky-400 bg-sky-500/15" },
    { titulo: "Locadores", valor: dados?.locadores ?? 0, sub: "Cadastrados", icone: User, cor: "text-violet-300 bg-violet-500/15" },
    { titulo: "Recebido", valor: recebido === null ? "—" : `${recebido}%`, sub: "Do lançado", icone: DollarSign, cor: "text-emerald-400 bg-emerald-500/15" },
  ];

  const atalhos = [
    { titulo: "Unidades", icone: Building2, href: "/unidades" },
    { titulo: "Kitnets", icone: House, href: "/kitnets" },
    { titulo: "Inquilinos", icone: Users, href: "/inquilinos" },
    { titulo: "Locadores", icone: User, href: "/locadores" },
    { titulo: "Contratos", icone: FileText, href: "/contratos" },
    { titulo: "Financeiro", icone: Wallet, href: "/financeiro" },
  ];

  const alertas = (dados?.alertas || []).slice(0, 3);
  const recentes = naoLidas.slice(0, 5);

  return (
    <div className="space-y-4">

      {/* SAUDAÇÃO */}

      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-emerald-500/20
          p-5
          min-h-[150px]
        "
        style={{
          backgroundImage:
            "linear-gradient(100deg, rgba(6,40,28,.96) 0%, rgba(6,40,28,.86) 55%, rgba(6,40,28,.45) 100%), url('/images/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
          {dataExtensa()}
        </p>

        <h1 className="mt-2 text-[26px] leading-tight font-extrabold text-white">
          {saudacao()}, {nomeProprio(primeiroNome)}! <span aria-hidden="true">👋</span>
        </h1>

        <p className="mt-2 max-w-[68%] text-[13px] leading-snug text-emerald-50/80">
          Aqui está o resumo da sua gestão hoje.
        </p>

        {clima && (
          <div
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2

              rounded-2xl
              border
              border-white/15
              bg-black/25
              backdrop-blur-md

              px-3.5
              py-2.5

              text-center
            "
          >
            <p className="text-xl font-bold text-white leading-none">
              {clima.temperatura}°C
            </p>
            <p className="mt-1 text-[10px] text-white/70">{clima.local}</p>
          </div>
        )}

      </section>

      {/* AÇÕES RÁPIDAS */}

      <section className="grid grid-cols-4 gap-2">
        {acoesRapidas.map(({ titulo, icone: Icone, href }) => (
          <Link
            key={titulo}
            href={href}
            className={`
              ${cartao}
              flex
              flex-col
              items-center
              justify-center
              gap-2
              px-1
              py-3.5
              min-h-[92px]
              text-center
              active:scale-95
              transition
            `}
          >
            <Icone size={24} className="text-emerald-400" />
            <span className="text-[11px] font-medium leading-tight text-[var(--text)]">
              {titulo}
            </span>
          </Link>
        ))}
      </section>

      {/* INDICADORES */}

      <section className="grid grid-cols-4 gap-2">
        {indicadores.map(({ titulo, valor, sub, icone: Icone, cor }) => (
          <div key={titulo} className={`${cartao} p-2.5`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cor}`}>
              <Icone size={15} />
            </div>
            <p className="mt-2 text-[11px] text-[var(--text-muted)] truncate">{titulo}</p>
            <p className="text-[22px] leading-none font-extrabold text-[var(--text)] tabular-nums">
              {valor}
            </p>
            <p className="mt-1 text-[10px] text-[var(--text-faint)] truncate">{sub}</p>
          </div>
        ))}
      </section>

      {/* OCUPAÇÃO */}

      <section className={`${cartao} p-4`}>

        <div className="flex items-center gap-2">
          <LayoutDashboard size={16} className="text-emerald-400" />
          <h2 className="text-[15px] font-bold text-[var(--text)]">
            Ocupação das residências
          </h2>
        </div>

        <div className="mt-3 flex items-center gap-4">

          <div className="flex-1 min-w-0">

            <div className="h-3 rounded-full bg-[var(--surface-3)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                style={{ width: `${Math.min(100, Math.max(0, percentual))}%` }}
              />
            </div>

            <div className="mt-3 flex items-center gap-4 text-[12px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <b className="text-[var(--text)]">{ocupadas}</b> Ocupadas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <b className="text-[var(--text)]">{vazias}</b> Vazias
              </span>
            </div>

          </div>

          <div className="shrink-0 text-center">
            <p className="text-[30px] leading-none font-extrabold text-emerald-400 tabular-nums">
              {percentual}%
            </p>
            <p className="mt-1 text-[10px] text-[var(--text-subtle)]">
              Taxa de ocupação
            </p>
          </div>

        </div>

      </section>

      {/* NOTIFICAÇÕES RECENTES */}

      <section className={`${cartao} p-4`}>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-emerald-400" />
            <h2 className="text-[15px] font-bold text-[var(--text)]">
              Notificações recentes
            </h2>
          </div>

          <Link
            href="/notificacoes"
            className="flex items-center gap-0.5 text-[12px] font-semibold text-emerald-400"
          >
            Ver todas
            <ChevronRight size={14} />
          </Link>
        </div>

        {recentes.length === 0 ? (
          <p className="mt-4 mb-1 text-center text-[13px] text-[var(--text-faint)]">
            Nenhuma notificação nova. Você está em dia.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border-token)]">
            {recentes.map((n) => {

              const { Icone, ponto } = aparenciaNotificacao(n);

              return (
                <li key={n.id}>
                  <button
                    onClick={() => {
                      marcarComoLida(n.id);
                      if (n.link) router.push(n.link);
                    }}
                    className="w-full flex items-center gap-3 py-3 text-left"
                  >
                    <span className="w-9 h-9 shrink-0 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-muted)]">
                      <Icone size={16} />
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] leading-snug text-[var(--text)] line-clamp-2">
                        {n.mensagem}
                      </span>
                      <span className="block mt-0.5 text-[11px] text-[var(--text-faint)]">
                        {formatarTempo(n.createdAt)}
                      </span>
                    </span>

                    <span className={`w-2.5 h-2.5 shrink-0 rounded-full ${ponto}`} />
                  </button>
                </li>
              );

            })}
          </ul>
        )}

      </section>

      {/* AVISOS (só aparece se houver) */}

      {alertas.length > 0 && (
        <section className={`${cartao} p-4`}>

          <div className="flex items-center gap-2">
            <TriangleAlert size={16} className="text-amber-400" />
            <h2 className="text-[15px] font-bold text-[var(--text)]">
              Avisos importantes
            </h2>
          </div>

          <ul className="mt-3 divide-y divide-[var(--border-token)]">
            {alertas.map((a) => (
              <li key={a.id}>
                <Link
                  href={a.link || "/"}
                  className="flex items-center gap-3 py-3"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] text-[var(--text)] leading-snug">
                      {a.titulo}
                    </span>
                    {a.descricao && (
                      <span className="block mt-0.5 text-[11px] text-[var(--text-faint)] line-clamp-1">
                        {a.descricao}
                      </span>
                    )}
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-[var(--text-faint)]" />
                </Link>
              </li>
            ))}
          </ul>

        </section>
      )}

      {/* ACESSO RÁPIDO */}

      <section>

        <div className="flex items-center gap-2 mb-2.5 px-1">
          <LayoutDashboard size={16} className="text-emerald-400" />
          <h2 className="text-[15px] font-bold text-[var(--text)]">Acesso rápido</h2>
        </div>

        <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-1 snap-x [scrollbar-width:none]">
          {atalhos.map(({ titulo, icone: Icone, href }) => (
            <Link
              key={titulo}
              href={href}
              className={`
                ${cartao}
                snap-start
                shrink-0
                w-[88px]
                py-3.5
                flex
                flex-col
                items-center
                gap-2
                active:scale-95
                transition
              `}
            >
              <Icone size={24} className="text-[var(--text)]" />
              <span className="text-[11px] font-medium text-[var(--text)]">{titulo}</span>
            </Link>
          ))}
        </div>

      </section>

    </div>
  );
}
