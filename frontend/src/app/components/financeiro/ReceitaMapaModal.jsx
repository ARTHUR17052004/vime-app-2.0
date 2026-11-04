"use client";

import { Send, CheckCircle2, Landmark, Clock } from "lucide-react";

// D+1 útil (pula sábado/domingo) -- é só uma ESTIMATIVA quando o banco
// ainda não confirmou a data de crédito de verdade (dataCredito). Boleto
// no Brasil compensa normalmente em D+1 útil desde 2016, mas pode variar
// por banco -- por isso sempre marcado como "estimativa", nunca como fato.
function estimarCredito(dataPagamento) {

  const data = new Date(dataPagamento);
  data.setDate(data.getDate() + 1);

  while (data.getDay() === 0 || data.getDay() === 6) {
    data.setDate(data.getDate() + 1);
  }

  return data;

}

function formatarDataHora(valor) {
  if (!valor) return null;
  return new Date(valor).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Linha({ icon: Icon, titulo, valor, detalhe, tone = "neutral" }) {

  const cores = {
    neutral: "text-[var(--text-subtle)] bg-[var(--surface-2)] border-[var(--border-token)]",
    done: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    estimate: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  };

  return (
    <div className="flex gap-4">
      <div className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center ${cores[tone]}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text)]">{titulo}</p>
        <p className="text-sm text-[var(--text-1)] mt-0.5">{valor}</p>
        {detalhe && (
          <p className="text-xs text-[var(--text-faint)] mt-0.5">{detalhe}</p>
        )}
      </div>
    </div>
  );

}

export default function ReceitaMapaModal({ isOpen, onClose, receita, contaNome }) {

  if (!isOpen || !receita) return null;

  const paga = receita.status === "PAGA" || receita.status === "PAGO";

  const credito = receita.dataCredito
    ? { data: receita.dataCredito, estimativa: false }
    : receita.dataPagamento
      ? { data: estimarCredito(receita.dataPagamento), estimativa: true }
      : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--surface-inset)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="min-h-full flex items-center justify-center">
        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl shadow-[0_18px_45px_rgba(0,0,0,.35)] w-full max-w-lg p-8 relative">

          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-2xl text-[var(--text-subtle)]"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
            Mapa da Cobrança
          </h2>
          <p className="text-sm text-[var(--text-subtle)] mb-8">
            {receita.descricao}
          </p>

          <div className="space-y-6">

            <Linha
              icon={Send}
              titulo="Cobrança enviada"
              tone={(receita.cobrancaEnviadaEm || receita.gatewayReferencia) ? "done" : "pending"}
              valor={
                receita.cobrancaEnviadaEm
                  ? formatarDataHora(receita.cobrancaEnviadaEm)
                  // Boleto antigo, enviado antes do sistema passar a
                  // registrar a hora exata (cobrancaEnviadaEm) -- tem
                  // número de referência do banco, então foi enviado
                  // de verdade, só não sabemos quando ao certo.
                  : receita.gatewayReferencia
                    ? "Enviada (data exata não registrada)"
                    : "Ainda não enviada ao banco"
              }
              detalhe={
                receita.gatewayProvider
                  ? `Via ${contaNome ? `${contaNome} (${receita.gatewayProvider})` : receita.gatewayProvider}`
                  : null
              }
            />

            <Linha
              icon={CheckCircle2}
              titulo="Pagamento identificado pelo sistema"
              tone={paga ? "done" : "pending"}
              valor={
                paga
                  ? formatarDataHora(receita.confirmacaoPagtoEnviadaEm || receita.dataPagamento)
                  : "Ainda não identificado"
              }
              detalhe={
                paga && receita.dataPagamento
                  ? `Pago em ${formatarDataHora(receita.dataPagamento)}`
                  : null
              }
            />

            <Linha
              icon={Landmark}
              titulo="Dinheiro na conta"
              tone={credito ? (credito.estimativa ? "estimate" : "done") : "pending"}
              valor={
                credito
                  ? new Date(credito.data).toLocaleDateString("pt-BR")
                  : "Ainda não há previsão (aguardando pagamento)"
              }
              detalhe={
                credito
                  ? credito.estimativa
                    ? "Estimativa (D+1 útil) -- o banco ainda não confirmou a data exata de crédito."
                    : "Confirmado pelo banco."
                  : null
              }
            />

          </div>

          {!paga && receita.cobrancaEnviadaEm && (
            <div className="mt-8 flex items-center gap-2 text-xs text-[var(--text-faint)]">
              <Clock size={14} />
              O sistema confere pagamentos automaticamente (a cada 15min pro BB, ou na hora por webhook pros outros bancos).
            </div>
          )}

        </div>
      </div>
    </div>
  );

}
