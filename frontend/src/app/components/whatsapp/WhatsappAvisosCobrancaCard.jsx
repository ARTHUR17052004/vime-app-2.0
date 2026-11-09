"use client";

import { useEffect, useState } from "react";
import { BellOff, MessageSquareOff } from "lucide-react";

import { WhatsappService } from "../../../services/whatsapp.service";
import { usePermissao } from "../../../hooks/usePermissao";

function Toggle({ ativo, disabled, onChange, rotuloLigado, rotuloDesligado }) {
  return (
    <label
      className={`
        flex
        items-center
        gap-3
        w-fit
        ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
      `}
    >
      <input
        type="checkbox"
        checked={ativo}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className="
          w-12
          h-7
          rounded-full
          bg-[var(--surface-2)]
          border
          border-[var(--border-token)]
          peer-checked:bg-emerald-500
          peer-checked:border-emerald-400
          transition
          relative
          after:content-['']
          after:absolute
          after:top-0.5
          after:left-0.5
          after:w-5
          after:h-5
          after:rounded-full
          after:bg-[var(--text)]
          after:transition-transform
          peer-checked:after:translate-x-5
        "
      />
      <span className="text-[var(--text-1)] font-medium">
        {ativo ? rotuloLigado : rotuloDesligado}
      </span>
    </label>
  );
}

// Dois comportamentos automáticos do WhatsApp, configuráveis sem mexer
// em código:
// 1. Avisos automáticos de cobrança (nova cobrança, lembrete, vencida,
//    pagamento confirmado -- ver whatsappAutomacaoService.js).
// 2. Modo somente envio -- inquilino para de "interagir de volta": o
//    sistema ignora qualquer mensagem recebida de um contato ligado a
//    inquilino (ver whatsappService.webhook). Não tem como travar o
//    botão de responder no aparelho dele, isso é do WhatsApp/Meta; o
//    que dá pra fazer é o sistema simplesmente não processar o que
//    chega.
export default function WhatsappAvisosCobrancaCard({
  dados,
  onAtualizar,
}) {
  const podeConfigurar = usePermissao("whatsapp.configurar");

  const [avisosAtivos, setAvisosAtivos] = useState(true);
  const [somenteEnvio, setSomenteEnvio] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!dados) return;

    setAvisosAtivos(dados.avisosCobrancaAtivos !== false);
    setSomenteEnvio(dados.modoSomenteEnvio === true);
  }, [dados]);

  async function salvar(campo, novoValor, setState) {
    try {
      setSalvando(true);
      setState(novoValor);

      await WhatsappService.salvarConfiguracao({
        [campo]: novoValor,
      });

      onAtualizar?.();
    } catch (error) {
      console.error(error);

      alert("Erro ao salvar configuração.");

      setState(!novoValor);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="
        rounded-3xl
        border
        border-[var(--border-token)]
        bg-[#101827]
        p-8
        shadow-xl
        space-y-8
      "
    >

      <div>

        <div className="flex items-center gap-3 mb-5">

          <div
            className="
              w-11
              h-11
              rounded-2xl
              bg-amber-500/10
              border
              border-amber-500/20
              flex
              items-center
              justify-center
            "
          >
            <BellOff size={20} className="text-amber-400" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[var(--text)]">
              Avisos Automáticos de Cobrança
            </h2>
            <p className="text-sm text-[var(--text-subtle)]">
              Nova cobrança, lembrete de vencimento, cobrança vencida e pagamento confirmado.
            </p>
          </div>

        </div>

        <Toggle
          ativo={avisosAtivos}
          disabled={!podeConfigurar || salvando}
          onChange={(v) => salvar("avisosCobrancaAtivos", v, setAvisosAtivos)}
          rotuloLigado="Avisos ativados"
          rotuloDesligado="Avisos desativados"
        />

      </div>

      <div className="border-t border-[var(--border-token)] pt-8">

        <div className="flex items-center gap-3 mb-5">

          <div
            className="
              w-11
              h-11
              rounded-2xl
              bg-sky-500/10
              border
              border-sky-500/20
              flex
              items-center
              justify-center
            "
          >
            <MessageSquareOff size={20} className="text-sky-400" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[var(--text)]">
              Modo Somente Envio
            </h2>
            <p className="text-sm text-[var(--text-subtle)]">
              Inquilino só recebe -- o que ele responder é ignorado pelo sistema.
            </p>
          </div>

        </div>

        <Toggle
          ativo={somenteEnvio}
          disabled={!podeConfigurar || salvando}
          onChange={(v) => salvar("modoSomenteEnvio", v, setSomenteEnvio)}
          rotuloLigado="Somente envio ativado"
          rotuloDesligado="Conversa normal (padrão)"
        />

        <p className="mt-4 text-sm text-[var(--text-faint)]">
          Ativado, a mensagem que um inquilino mandar não é salva, não aparece na tela de
          Conversas e não gera notificação nem resposta automática da IA -- some, como se não
          tivesse sido enviada. Contato que não é inquilino cadastrado continua normal.
        </p>

      </div>

    </div>
  );
}
