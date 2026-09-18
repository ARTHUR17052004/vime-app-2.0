"use client";

import { useEffect, useState } from "react";
import { Smartphone, BellRing, ShieldOff, Check, Share } from "lucide-react";

import { PushService } from "@/services/push.service";

// Detecta iOS pra dar a instrução certa -- Safari só entrega push pra
// PWA instalada na tela de início (Adicionar à Tela de Início), nunca
// pra aba aberta normal, então "Ativar" sozinho não resolve lá.
function ehIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function rodandoStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)")?.matches
    || window.navigator.standalone === true;
}

export default function AtivarNotificacoesPush() {

  const [estado, setEstado] = useState("verificando");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {

    async function verificar() {

      if (!PushService.suportado()) {
        setEstado("sem-suporte");
        return;
      }

      if (ehIOS() && !rodandoStandalone()) {
        setEstado("ios-precisa-instalar");
        return;
      }

      if (PushService.permissao() === "denied") {
        setEstado("bloqueada");
        return;
      }

      const inscricao = await PushService.inscricaoAtual();
      setEstado(inscricao ? "ativa" : "inativa");

    }

    verificar().catch(() => setEstado("sem-suporte"));

  }, []);

  async function ativar() {

    setErro("");
    setCarregando(true);

    try {
      await PushService.ativar();
      setEstado("ativa");
    } catch (err) {
      setErro(err.message || "Não foi possível ativar.");
      if (PushService.permissao() === "denied") setEstado("bloqueada");
    } finally {
      setCarregando(false);
    }

  }

  async function desativar() {

    setCarregando(true);

    try {
      await PushService.desativar();
      setEstado("inativa");
    } catch (err) {
      setErro(err.message || "Não foi possível desativar.");
    } finally {
      setCarregando(false);
    }

  }

  if (estado === "verificando" || estado === "sem-suporte") return null;

  const base = `
    rounded-2xl
    border
    p-5
    flex
    items-start
    gap-4
    flex-wrap
  `;

  if (estado === "ios-precisa-instalar") {
    return (
      <div className={`${base} border-sky-500/25 bg-sky-500/[.06]`}>
        <Share size={20} className="text-sky-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-[220px]">
          <p className="text-sm font-semibold text-[var(--text)]">
            Receba avisos no iPhone
          </p>
          <p className="mt-1 text-sm text-[var(--text-subtle)]">
            No Safari, toque em <b>Compartilhar</b> e depois em{" "}
            <b>Adicionar à Tela de Início</b>. Abrindo o app por esse ícone,
            você pode ativar as notificações aqui.
          </p>
        </div>
      </div>
    );
  }

  if (estado === "bloqueada") {
    return (
      <div className={`${base} border-red-500/25 bg-red-500/[.06]`}>
        <ShieldOff size={20} className="text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-[220px]">
          <p className="text-sm font-semibold text-[var(--text)]">
            Notificações bloqueadas
          </p>
          <p className="mt-1 text-sm text-[var(--text-subtle)]">
            Seu navegador está bloqueando avisos deste site. Habilite manualmente
            nas configurações do site (o cadeado ao lado do endereço) e recarregue.
          </p>
        </div>
      </div>
    );
  }

  if (estado === "ativa") {
    return (
      <div className={`${base} border-emerald-500/25 bg-emerald-500/[.06]`}>
        <Check size={20} className="text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-[220px]">
          <p className="text-sm font-semibold text-[var(--text)]">
            Notificações no celular ativadas
          </p>
          <p className="mt-1 text-sm text-[var(--text-subtle)]">
            Você vai receber avisos aqui mesmo com o app fechado.
          </p>
        </div>
        <button
          onClick={desativar}
          disabled={carregando}
          className="text-xs font-semibold text-[var(--text-faint)] hover:text-[var(--text-subtle)] transition shrink-0"
        >
          Desativar
        </button>
      </div>
    );
  }

  return (
    <div className={`${base} border-[var(--border-token)] bg-[var(--surface-2)]`}>
      <Smartphone size={20} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-[220px]">
        <p className="text-sm font-semibold text-[var(--text)]">
          Receba avisos no celular
        </p>
        <p className="mt-1 text-sm text-[var(--text-subtle)]">
          Ative pra ser notificado (kitnet vazia, prazo vencido, vistoria
          atrasada...) mesmo com o app fechado.
        </p>
        {erro && (
          <p className="mt-2 text-xs text-red-400">{erro}</p>
        )}
      </div>
      <button
        onClick={ativar}
        disabled={carregando}
        className="
          shrink-0
          inline-flex items-center gap-2
          px-4 py-2.5
          rounded-xl
          bg-emerald-500
          text-white
          text-sm
          font-semibold
          hover:bg-emerald-600
          transition
          disabled:opacity-60
        "
      >
        <BellRing size={16} />
        {carregando ? "Ativando..." : "Ativar"}
      </button>
    </div>
  );

}
