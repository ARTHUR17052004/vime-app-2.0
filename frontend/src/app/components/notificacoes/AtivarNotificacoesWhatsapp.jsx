"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { AuthService } from "@/services/auth.service";
import { Sessao } from "@/utils/sessao";

// Manda a mesma notificação (a que já cai no sino/push) também pro
// WhatsApp do usuário. Best-effort -- ver notificarSistemaWhatsapp no
// backend (a Meta só entrega mensagem livre fora de modelo aprovado
// dentro de 24h depois do usuário escrever pro número da VIME).
export default function AtivarNotificacoesWhatsapp() {

  const { usuario, setUsuario } = useAuth();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const ativo = Boolean(usuario?.notificarWhatsapp);
  const temTelefone = Boolean(usuario?.telefone);

  async function alternar() {

    if (!temTelefone) {
      setErro("Cadastre seu telefone no Perfil antes de ativar.");
      return;
    }

    setErro("");
    setSalvando(true);

    try {

      const resposta = await AuthService.atualizarPerfil({ notificarWhatsapp: !ativo });
      const atualizado = resposta.data || resposta;
      const usuarioAtualizado = { ...usuario, ...atualizado };

      setUsuario(usuarioAtualizado);
      Sessao.atualizarUsuario(usuarioAtualizado);

    } catch (err) {

      setErro(err.message || "Não foi possível salvar.");

    } finally {

      setSalvando(false);

    }

  }

  return (
    <div
      className="
        rounded-2xl
        border
        border-[var(--border-token)]
        bg-[var(--surface)]
        backdrop-blur-xl
        p-5
        flex
        items-center
        gap-4
        flex-wrap
      "
    >
      <MessageCircle
        size={20}
        className={ativo ? "text-emerald-400 shrink-0" : "text-[var(--text-faint)] shrink-0"}
      />

      <div className="flex-1 min-w-[200px]">
        <p className="text-sm font-semibold text-[var(--text)]">
          Notificações no WhatsApp
        </p>
        <p className="mt-1 text-sm text-[var(--text-subtle)]">
          {temTelefone
            ? `Recebe as mesmas notificações do sino também no seu WhatsApp (${usuario.telefone}).`
            : "Cadastre seu telefone no Perfil pra poder ativar."}
        </p>
        {erro && <p className="mt-1 text-xs text-red-400">{erro}</p>}
      </div>

      <button
        onClick={alternar}
        disabled={salvando || !temTelefone}
        role="switch"
        aria-checked={ativo}
        className={`
          shrink-0
          relative
          w-14
          h-8
          rounded-full
          transition
          disabled:opacity-50
          ${ativo ? "bg-emerald-500" : "bg-[var(--surface-3)]"}
        `}
      >
        <span
          className={`
            absolute
            top-1
            w-6
            h-6
            rounded-full
            bg-white
            transition-all
            ${ativo ? "left-7" : "left-1"}
          `}
        />
      </button>
    </div>
  );
}
