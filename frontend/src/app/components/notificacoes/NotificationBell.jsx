"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BellRing,
  MessageCircle,
  DollarSign,
  FileText,
  CheckCheck,
} from "lucide-react";

import { useNotificacoes } from "../../../hooks/useNotificacoes";
const origemConfig = {
  WHATSAPP: {
    icon: MessageCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  ASAAS: {
    icon: DollarSign,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
  },
  CLICKSIGN: {
    icon: FileText,
    color: "text-yellow-300",
    bg: "bg-yellow-500/10",
  },
  SISTEMA: {
    icon: Bell,
    color: "text-[var(--text-muted)]",
    bg: "bg-[var(--surface-2)]",
  },
};

function formatarTempo(data) {
  const diff = Date.now() - new Date(data).getTime();
  const minutos = Math.floor(diff / 60000);

  if (minutos < 1) return "agora mesmo";
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;

  const dias = Math.floor(horas / 24);
  return `há ${dias} d`;
}

export default function NotificationBell() {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef(null);
  const router = useRouter();

  const { naoLidas, loading, marcarComoLida, marcarTodasComoLidas } =
    useNotificacoes();

  useEffect(() => {
    function aoClicarFora(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  const total = naoLidas.length;

  return (
    <div ref={containerRef} className="sm:relative">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-label={total > 0 ? `${total} notificações não lidas` : "Notificações"}
        className={`
          relative
          w-10 h-10 sm:w-12 sm:h-12
          rounded-full
          flex items-center justify-center
          transition
          ${total > 0
            ? "bg-emerald-500/15 border border-emerald-400/50 hover:bg-emerald-500/25 sino-brilho"
            : "hover:bg-[var(--surface-2)]"}
        `}
      >
        {total > 0 ? (
          <BellRing
            className="sino-balancando w-[22px] h-[22px] sm:w-[26px] sm:h-[26px] text-emerald-300"
            strokeWidth={2.4}
          />
        ) : (
          <Bell className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] text-[var(--text)]" />
        )}

        {total > 0 && (
          <span
            className="
              sino-badge
              absolute
              -top-1.5
              -right-1.5

              min-w-[22px]
              h-[22px]

              px-1.5

              rounded-full

              bg-red-500

              border-2
              border-slate-900

              flex
              items-center
              justify-center

              text-[12px]
              font-extrabold
              text-white
              shadow-lg shadow-red-500/40
            "
          >
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="
              absolute
              left-4
              right-4
              top-full
              mt-2
              sm:left-auto
              sm:right-0
              sm:top-auto
              sm:mt-3
              sm:w-96

              rounded-2xl

              border
              border-[var(--border-token)]

              bg-[var(--select-option-bg)]
              sm:bg-[var(--surface)]

              backdrop-blur-xl

              shadow-2xl

              overflow-hidden

              z-50
            "
          >
            <div
              className="
                flex
                items-center
                justify-between

                px-5
                py-4

                border-b
                border-[var(--border-token)]
              "
            >
              <p className="text-sm font-semibold text-[var(--text)]">
                Notificações
              </p>

              {total > 0 && (
                <button
                  onClick={marcarTodasComoLidas}
                  className="
                    flex
                    items-center
                    gap-1.5

                    text-[11px]
                    font-medium

                    text-emerald-400

                    hover:text-emerald-300

                    transition
                  "
                >
                  <CheckCheck size={13} />
                  Marcar todas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="px-5 py-10 text-center text-sm text-[var(--text-faint)]">
                  Carregando...
                </div>
              )}

              {!loading && total === 0 && (
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center

                    px-5
                    py-10

                    text-center
                  "
                >
                  <div
                    className="
                      w-12
                      h-12

                      rounded-full

                      bg-emerald-500/10

                      border
                      border-emerald-500/20

                      flex
                      items-center
                      justify-center

                      text-emerald-400

                      mb-3
                    "
                  >
                    <Bell size={20} />
                  </div>

                  <p className="text-sm font-medium text-[var(--text)]">
                    Sem notificações
                  </p>

                  <p className="mt-1 text-xs text-[var(--text-faint)]">
                    Você está em dia por aqui.
                  </p>
                </div>
              )}

              {!loading &&
                naoLidas.map((notificacao) => {
                  const config =
                    origemConfig[notificacao.origem] || origemConfig.SISTEMA;

                  const Icone = config.icon;

                  return (
                    <button
                      key={notificacao.id}
                      onClick={() => {
                        marcarComoLida(notificacao.id);

                        if (notificacao.link) {
                          setAberto(false);
                          router.push(notificacao.link);
                        }
                      }}
                      className="
                        w-full

                        flex
                        items-start
                        gap-3

                        px-5
                        py-4

                        text-left

                        border-b
                        border-[var(--border-token)]

                        hover:bg-[var(--surface-2)]

                        transition
                      "
                    >
                      <div
                        className={`
                          w-9
                          h-9

                          shrink-0

                          rounded-full

                          flex
                          items-center
                          justify-center

                          ${config.bg}
                          ${config.color}
                        `}
                      >
                        <Icone size={16} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[var(--text)] truncate">
                          {notificacao.titulo}
                        </p>

                        <p className="mt-0.5 text-xs text-[var(--text-subtle)] line-clamp-2">
                          {notificacao.mensagem}
                        </p>

                        <p className="mt-1.5 text-[11px] text-[var(--text-faint)]">
                          {formatarTempo(notificacao.createdAt)}
                        </p>
                      </div>

                      <span
                        className="
                          mt-1.5

                          w-2
                          h-2

                          shrink-0

                          rounded-full

                          bg-emerald-400
                        "
                      />
                    </button>
                  );
                })}
            </div>

            <button
              onClick={() => {
                setAberto(false);
                router.push("/notificacoes");
              }}
              className="
                w-full

                px-5
                py-3.5

                text-center

                text-[13px]
                font-semibold

                text-emerald-400

                hover:bg-[var(--surface-2)]

                border-t
                border-[var(--border-token)]

                transition
              "
            >
              Ver todas as notificações
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}