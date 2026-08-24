/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  House,
  ClipboardList,
  Wallet,
  Home,
  Maximize,
  Minimize,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import RevenueChart from "../components/charts/RevenueChart";
import OccupancyChart from "../components/charts/OccupancyChart";
import AnimatedNumber, { useAnimatedNumber } from "../components/ui/AnimatedNumber";

import { DashboardService } from "@/services/dashboard.service";
import { formatCurrency } from "@/utils/formatCurrency";

const INTERVALO_ATUALIZACAO_MS = 25000;
const ANO_ATUAL = new Date().getFullYear();

export default function TvPage() {
  return (
    <ProtectedRoute>
      <TvConteudo />
    </ProtectedRoute>
  );
}

function TvConteudo() {
  const router = useRouter();

  const [dados, setDados] = useState(null);
  const [receitasMensais, setReceitasMensais] = useState([]);
  const [agora, setAgora] = useState(new Date());
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [telaCheia, setTelaCheia] = useState(false);
  const [controlesVisiveis, setControlesVisiveis] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const [dashboard, mensais] = await Promise.all([
        DashboardService.listar(),
        DashboardService.receitasMensais(ANO_ATUAL),
      ]);

      setDados(dashboard);
      setReceitasMensais(mensais);
      setUltimaAtualizacao(new Date());
    } catch (err) {
      console.error("Modo TV: falha ao atualizar", err);
    }
  }, []);

  useEffect(() => {
    carregar();
    const intervalo = setInterval(carregar, INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(intervalo);
  }, [carregar]);

  useEffect(() => {
    const relogio = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(relogio);
  }, []);

  useEffect(() => {
    function aoMudarTelaCheia() {
      setTelaCheia(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", aoMudarTelaCheia);
    return () =>
      document.removeEventListener("fullscreenchange", aoMudarTelaCheia);
  }, []);

  useEffect(() => {
    let timeout = setTimeout(() => setControlesVisiveis(false), 4000);

    function reset() {
      setControlesVisiveis(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setControlesVisiveis(false), 4000);
    }

    window.addEventListener("mousemove", reset);
    window.addEventListener("touchstart", reset);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("touchstart", reset);
    };
  }, []);

  function alternarTelaCheia() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  const financeiro = dados?.financeiro;
  const ocupacao = dados?.ocupacao;

  const horaFormatada = agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const dataFormatada = agora.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className="
        relative
        min-h-screen
        h-screen

        overflow-hidden
      "
    >
      <div
        className="
          fixed
          inset-0
          -z-20
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{ backgroundImage: "url('/images/background.jpg')" }}
      />

      <div className="fixed inset-0 -z-10 bg-[var(--surface-inset)] backdrop-blur-sm" />

      <div className="relative h-full flex flex-col px-10 py-8 xl:px-16 xl:py-10">

        {/* ========================= */}
        {/* TOPO */}
        {/* ========================= */}

        <div className="flex items-center justify-between shrink-0">

          <div className="flex items-center gap-5">
            <img
              src="/images/logo-vime.jpeg"
              alt="VIME"
              className="w-14 h-14 rounded-2xl object-contain"
              draggable={false}
            />

            <div>
              <h1 className="text-3xl font-black text-[var(--text)] leading-none">
                VIME <span className="text-emerald-400">2.0</span>
              </h1>
              <p className="mt-1.5 text-[13px] uppercase tracking-[0.3em] text-emerald-400/80 font-semibold">
                Painel ao vivo
              </p>
            </div>

            <div className="ml-4 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                Ao vivo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-5xl font-black text-[var(--text)] tabular-nums leading-none">
                {horaFormatada}
              </p>
              <p className="mt-1.5 text-sm text-[var(--text-subtle)] capitalize">
                {dataFormatada}
              </p>
            </div>

            <div
              className={`
                flex items-center gap-2
                transition-opacity duration-500
                ${controlesVisiveis ? "opacity-100" : "opacity-0 pointer-events-none"}
              `}
            >
              <button
                onClick={alternarTelaCheia}
                title={telaCheia ? "Sair da tela cheia" : "Tela cheia"}
                className="w-11 h-11 rounded-xl bg-[var(--surface-2)] border border-[var(--border-token)] hover:bg-[var(--surface-3)] flex items-center justify-center transition"
              >
                {telaCheia ? (
                  <Minimize size={18} className="text-[var(--text)]" />
                ) : (
                  <Maximize size={18} className="text-[var(--text)]" />
                )}
              </button>

              <button
                onClick={() => router.push("/")}
                title="Sair do Modo TV"
                className="w-11 h-11 rounded-xl bg-[var(--surface-2)] border border-[var(--border-token)] hover:bg-red-500/20 hover:border-red-500/30 flex items-center justify-center transition"
              >
                <X size={18} className="text-[var(--text)]" />
              </button>
            </div>
          </div>

        </div>

        {/* ========================= */}
        {/* CARDS */}
        {/* ========================= */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-10 grid grid-cols-4 gap-6 shrink-0"
        >
          <TvStatCard
            titulo="Inquilinos"
            subtitulo="Ativos"
            valor={dados?.inquilinos ?? 0}
            icon={Users}
          />
          <TvStatCard
            titulo="Residências"
            subtitulo="Ativas"
            valor={dados?.unidades ?? 0}
            icon={Building2}
          />
          <TvStatCard
            titulo="Kitnets"
            subtitulo="Total"
            valor={dados?.kitnets ?? 0}
            icon={House}
          />
          <TvStatCard
            titulo="Solicitações"
            subtitulo="Pendentes"
            valor={dados?.solicitacoesPendentes ?? 0}
            icon={ClipboardList}
          />
        </motion.div>

        {/* ========================= */}
        {/* GRÁFICOS */}
        {/* ========================= */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8 flex-1 min-h-0 grid grid-cols-12 gap-6"
        >

          <div className="col-span-8 rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-8 flex flex-col min-h-0">

            <div className="flex items-center justify-between shrink-0">
              <div>
                <p className="text-[12px] uppercase tracking-[0.3em] text-emerald-400/80 font-semibold">
                  Financeiro
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[var(--text)]">
                  Receitas mensais
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Wallet size={22} className="text-emerald-400" />
              </div>
            </div>

            <div className="flex-1 min-h-0 mt-4">
              <RevenueChart data={receitasMensais.length ? receitasMensais : undefined} />
            </div>

            <div className="grid grid-cols-3 gap-5 shrink-0">
              <TvResumoFinanceiro titulo="Recebido" valor={financeiro?.recebido} cor="emerald" />
              <TvResumoFinanceiro titulo="Pendente" valor={financeiro?.pendente} cor="yellow" />
              <TvResumoFinanceiro titulo="Atrasado" valor={financeiro?.atrasado} cor="red" />
            </div>

          </div>

          <div className="col-span-4 rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-8 flex flex-col min-h-0">

            <div className="flex items-center justify-between shrink-0">
              <div>
                <p className="text-[12px] uppercase tracking-[0.3em] text-emerald-400/80 font-semibold">
                  Ocupação
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[var(--text)]">
                  Residências
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Home size={22} className="text-emerald-400" />
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-6">
              <OccupancyChart
                ocupadas={ocupacao?.ocupadas ?? 0}
                vazias={ocupacao?.vazias ?? 0}
              />

              <div className="w-full space-y-3">
                <TvLegendaItem cor="bg-emerald-400" titulo="Ocupadas" valor={ocupacao?.ocupadas ?? 0} />
                <TvLegendaItem cor="bg-amber-400" titulo="Vagas" valor={ocupacao?.vazias ?? 0} />
              </div>
            </div>

            <div className="shrink-0 pt-5 border-t border-[var(--border-token)] flex items-center justify-between">
              <span className="text-sm text-[var(--text-subtle)]">Taxa de ocupação</span>
              <span className="text-3xl font-black text-emerald-400 tabular-nums">
                <AnimatedNumber value={ocupacao?.percentual ?? 0} formatador={(v) => `${v}%`} />
              </span>
            </div>

          </div>

        </motion.div>

        <p className="mt-6 text-center text-[12px] text-[var(--text-faint)] shrink-0">
          {ultimaAtualizacao
            ? `Atualizado às ${ultimaAtualizacao.toLocaleTimeString("pt-BR")} · próxima atualização automática`
            : "Carregando dados ao vivo..."}
        </p>

      </div>
    </div>
  );
}

function TvStatCard({ titulo, subtitulo, valor, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-7 flex items-center justify-between">
      <div>
        <p className="text-[13px] uppercase tracking-[0.2em] text-[var(--text-subtle)] font-semibold">
          {titulo}
        </p>

        <p className="mt-3 text-5xl font-black text-[var(--text)] tabular-nums leading-none">
          <AnimatedNumber value={valor} />
        </p>

        <p className="mt-2 text-sm text-[var(--text-faint)]">{subtitulo}</p>
      </div>

      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <Icon size={28} className="text-emerald-400" />
      </div>
    </div>
  );
}

function TvResumoFinanceiro({ titulo, valor, cor }) {
  const cores = {
    emerald: "text-emerald-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
  };

  const animado = useAnimatedNumber(Math.round(Number(valor || 0)));

  return (
    <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] px-6 py-5">
      <p className="text-[12px] text-[var(--text-subtle)] font-medium">{titulo}</p>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${cores[cor]}`}>
        {formatCurrency(animado)}
      </p>
    </div>
  );
}

function TvLegendaItem({ cor, titulo, valor }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full ${cor}`} />
        <span className="text-[var(--text-muted)]">{titulo}</span>
      </div>
      <span className="text-2xl font-bold text-[var(--text)] tabular-nums">
        <AnimatedNumber value={valor} />
      </span>
    </div>
  );
}
