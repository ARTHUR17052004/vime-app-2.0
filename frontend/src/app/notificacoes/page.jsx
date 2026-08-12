"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  MessageCircle,
  DollarSign,
  FileText,
  CheckCheck,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import FadeIn from "../components/ui/FadeIn";

import { useNotificacoes } from "../../hooks/useNotificacoes";
import { NotificacaoService } from "../../services/notificacao.service";

const origens = [
  { valor: "TODOS", label: "Todos" },
  { valor: "WHATSAPP", label: "WhatsApp" },
  { valor: "ASAAS", label: "Asaas" },
  { valor: "CLICKSIGN", label: "ClickSign" },
  { valor: "SISTEMA", label: "Sistema" },
];

const origemConfig = {
  WHATSAPP: {
    icon: MessageCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    badge: "emerald",
  },
  ASAAS: {
    icon: DollarSign,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    badge: "blue",
  },
  CLICKSIGN: {
    icon: FileText,
    color: "text-yellow-300",
    bg: "bg-yellow-500/10",
    badge: "yellow",
  },
  SISTEMA: {
    icon: Bell,
    color: "text-gray-300",
    bg: "bg-white/5",
    badge: "gray",
  },
};

function formatarData(data) {
  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificacaoItem({ notificacao, onMarcarComoLida, lida }) {
  const config = origemConfig[notificacao.origem] || origemConfig.SISTEMA;
  const Icone = config.icon;

  return (
    <div
      className="
        flex
        items-start
        gap-4

        py-5

        border-b
        border-white/5

        last:border-b-0
      "
    >
      <div
        className={`
          w-11
          h-11

          shrink-0

          rounded-2xl

          flex
          items-center
          justify-center

          ${config.bg}
          ${config.color}
        `}
      >
        <Icone size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[15px] font-semibold text-white">
            {notificacao.titulo}
          </p>

          <Badge variant={config.badge} size="sm">
            {notificacao.origem}
          </Badge>
        </div>

        <p className="mt-1.5 text-sm text-gray-400">
          {notificacao.mensagem}
        </p>

        <p className="mt-2 text-xs text-gray-500">
          {formatarData(notificacao.createdAt)}
        </p>
      </div>

      {!lida && (
        <button
          onClick={() => onMarcarComoLida(notificacao.id)}
          className="
            shrink-0

            text-xs
            font-medium

            text-emerald-400

            hover:text-emerald-300

            transition

            whitespace-nowrap
          "
        >
          Marcar como lida
        </button>
      )}
    </div>
  );
}

export default function NotificacoesPage() {
  const { naoLidas, loading, marcarComoLida, marcarTodasComoLidas } =
    useNotificacoes();

  const [aba, setAba] = useState("nao-lidas");
  const [origemFiltro, setOrigemFiltro] = useState("TODOS");
  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  useEffect(() => {
    if (aba !== "historico") return;

    async function carregar() {
      setCarregandoHistorico(true);
      try {
        const resposta = await NotificacaoService.listarHistorico();
        setHistorico(resposta.data || []);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setCarregandoHistorico(false);
      }
    }

    carregar();
  }, [aba]);

  const lista = aba === "nao-lidas" ? naoLidas : historico;

  const listaFiltrada =
    origemFiltro === "TODOS"
      ? lista
      : lista.filter((n) => n.origem === origemFiltro);

  const carregandoAtual = aba === "nao-lidas" ? loading : carregandoHistorico;

  return (
    <MainLayout>
    <div className="max-w-[1700px] mx-auto px-8 xl:px-10 py-8 space-y-10">
      {/* HEADER */}
      <FadeIn delay={0}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Notificações</h1>

            <p className="mt-1 text-sm text-gray-400">
              Acompanhe os avisos gerados pelo sistema e integrações.
            </p>
          </div>

          {aba === "nao-lidas" && naoLidas.length > 0 && (
            <Button
              variant="secondary"
              leftIcon={<CheckCheck size={16} />}
              onClick={marcarTodasComoLidas}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </FadeIn>

      {/* STATS */}
      <FadeIn delay={0.10}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card padding="sm">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Não lidas
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {naoLidas.length}
            </p>
          </Card>

          {origens.slice(1).map(({ valor, label }) => {
            const config = origemConfig[valor];
            const Icone = config.icon;

            const qtd = naoLidas.filter((n) => n.origem === valor).length;

            return (
              <Card key={valor} padding="sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    {label}
                  </p>
                  <Icone size={16} className={config.color} />
                </div>
                <p className="mt-2 text-3xl font-bold text-white">{qtd}</p>
              </Card>
            );
          })}
        </div>
      </FadeIn>

      {/* ABAS + FILTROS */}
      <FadeIn delay={0.20}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAba("nao-lidas")}
              className={`
                px-4
                h-10

                rounded-xl

                text-sm
                font-semibold

                transition

                ${
                  aba === "nao-lidas"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              Não lidas
            </button>

            <button
              onClick={() => setAba("historico")}
              className={`
                px-4
                h-10

                rounded-xl

                text-sm
                font-semibold

                transition

                ${
                  aba === "historico"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              Histórico
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {origens.map(({ valor, label }) => (
              <button
                key={valor}
                onClick={() => setOrigemFiltro(valor)}
                className={`
                  px-3.5
                  h-9

                  rounded-full

                  text-xs
                  font-semibold

                  border

                  transition

                  ${
                    origemFiltro === valor
                      ? "bg-white/10 text-white border-white/20"
                      : "text-gray-400 border-white/10 hover:text-white"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* CONTEÚDO */}
      <FadeIn delay={0.30}>
        <Card padding="none">
          {carregandoAtual && (
            <div className="py-16 text-center text-sm text-gray-500">
              Carregando...
            </div>
          )}

          {!carregandoAtual && listaFiltrada.length === 0 && (
            <div className="py-4">
              <EmptyState
                icon={<Bell size={48} />}
                title="Sem notificações"
                description={
                  aba === "nao-lidas"
                    ? "Você está em dia — nenhuma notificação pendente no momento."
                    : "Ainda não existem notificações no histórico."
                }
              />
            </div>
          )}

          {!carregandoAtual && listaFiltrada.length > 0 && (
            <div className="px-8">
              {listaFiltrada.map((notificacao) => (
                <NotificacaoItem
                  key={notificacao.id}
                  notificacao={notificacao}
                  onMarcarComoLida={marcarComoLida}
                  lida={aba === "historico"}
                />
              ))}
            </div>
          )}
        </Card>
      </FadeIn>
    </div>
    </MainLayout>
  );
}