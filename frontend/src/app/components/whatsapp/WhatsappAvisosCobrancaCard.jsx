"use client";

import { useEffect, useState } from "react";
import { BellOff } from "lucide-react";

import { WhatsappService } from "../../../services/whatsapp.service";
import { usePermissao } from "../../../hooks/usePermissao";

// Liga/desliga os 4 avisos automáticos de cobrança pro inquilino (nova
// cobrança, lembrete de vencimento, cobrança vencida, pagamento
// confirmado -- ver whatsappAutomacaoService.js). Desligado, o chat
// manual e o assistente de IA continuam funcionando normalmente, só
// esses 4 disparos automáticos ficam quietos.
export default function WhatsappAvisosCobrancaCard({
  dados,
  onAtualizar,
}) {
  const podeConfigurar = usePermissao("whatsapp.configurar");

  const [ativo, setAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!dados) return;

    setAtivo(dados.avisosCobrancaAtivos !== false);
  }, [dados]);

  async function salvar(novoValor) {
    try {
      setSalvando(true);
      setAtivo(novoValor);

      await WhatsappService.salvarConfiguracao({
        avisosCobrancaAtivos: novoValor,
      });

      onAtualizar?.();
    } catch (error) {
      console.error(error);

      alert("Erro ao salvar configuração.");

      setAtivo(!novoValor);
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
      "
    >
      <div className="flex items-center gap-3 mb-6">

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
          <h2 className="text-2xl font-bold text-[var(--text)]">
            Avisos Automáticos de Cobrança
          </h2>
          <p className="text-sm text-[var(--text-subtle)]">
            Nova cobrança, lembrete de vencimento, cobrança vencida e pagamento confirmado.
          </p>
        </div>

      </div>

      <label
        className={`
          flex
          items-center
          gap-3
          w-fit
          ${podeConfigurar ? "cursor-pointer" : "cursor-not-allowed opacity-70"}
        `}
      >
        <input
          type="checkbox"
          checked={ativo}
          disabled={!podeConfigurar || salvando}
          onChange={(e) => salvar(e.target.checked)}
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
          {ativo ? "Avisos ativados" : "Avisos desativados"}
        </span>
      </label>

      <p className="mt-4 text-sm text-[var(--text-faint)]">
        Desativado, nenhum desses 4 avisos sai sozinho pro inquilino -- a conversa manual
        (chat normal) e o assistente de IA continuam funcionando normalmente.
      </p>

    </div>
  );
}
