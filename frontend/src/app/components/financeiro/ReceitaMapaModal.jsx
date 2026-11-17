"use client";

import { useEffect, useState } from "react";
import { FilePlus2, Send, CheckCircle2, Landmark, ScrollText } from "lucide-react";

import { ReceitaService } from "@/services/financeiro.service";

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

// Registro de processo -- um item da linha do tempo completa, estilo
// ata de escrivão: hora exata + o que aconteceu + quem/detalhe.
function RegistroDeProcesso({ evento, ultimo }) {

  return (
    <div className="flex gap-4">

      <div className="flex flex-col items-center shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 mt-1.5" />
        {!ultimo && <div className="w-px flex-1 bg-[var(--border-token)] mt-1" />}
      </div>

      <div className="flex-1 min-w-0 pb-5">
        <p className="text-xs text-[var(--text-faint)]">
          {formatarDataHora(evento.data)}
        </p>
        <p className="text-sm font-semibold text-[var(--text)] mt-0.5">
          {evento.titulo}
        </p>
        {evento.descricao && (
          <p className="text-xs text-[var(--text-subtle)] mt-0.5">
            {evento.descricao}
          </p>
        )}
      </div>

    </div>
  );

}

export default function ReceitaMapaModal({ isOpen, onClose, receita, contaNome }) {

  const [mapa, setMapa] = useState(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {

    if (!isOpen || !receita?.id) return;

    let cancelado = false;

    async function carregarMapa() {

      setCarregando(true);

      try {

        const resposta = await ReceitaService.historico(receita.id);

        if (!cancelado) {
          setMapa(resposta?.data || null);
        }

      } catch (erro) {

        console.error("Erro ao carregar o mapa da cobrança:", erro);
        if (!cancelado) setMapa(null);

      } finally {

        if (!cancelado) setCarregando(false);

      }

    }

    carregarMapa();

    return () => {
      cancelado = true;
    };

  }, [isOpen, receita?.id]);

  if (!isOpen || !receita) return null;

  const paga = receita.status === "PAGA" || receita.status === "PAGO";

  const credito = receita.dataCredito
    ? { data: receita.dataCredito, estimativa: false }
    : receita.dataPagamento
      ? { data: estimarCredito(receita.dataPagamento), estimativa: true }
      : null;

  // Tudo abaixo vem pronto do backend (receitaService.historico) --
  // ele que faz o papel de escrivão, juntando Auditoria com os
  // timestamps soltos que webhook/job de banco gravam sem passar por
  // auditoria nenhuma. O front só mostra o que chegou.
  const criadoPor = mapa?.criadoPor || null;
  const nasceuPaga = mapa?.nasceuPaga || false;
  const enviadaAoBanco = mapa?.enviadaAoBanco ?? Boolean(receita.cobrancaEnviadaEm || receita.gatewayReferencia);
  const motivoNaoEnviada = mapa?.motivoNaoEnviada || null;
  const infoPagamentoManual = mapa?.infoPagamentoManual || null;
  const eventos = mapa?.eventos || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--surface-inset)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="min-h-full flex items-center justify-center">
        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl shadow-[0_18px_45px_rgba(0,0,0,.35)] w-full max-w-xl p-8 relative max-h-[90vh] overflow-y-auto">

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
              icon={FilePlus2}
              titulo="Cobrança criada"
              tone="done"
              valor={formatarDataHora(receita.createdAt) || "Data não registrada"}
              detalhe={
                carregando
                  ? "Carregando quem criou..."
                  : criadoPor
                    ? `Criada por ${criadoPor}`
                    : "Criada automaticamente pelo sistema (ex.: recorrência do contrato)"
              }
            />

            <Linha
              icon={Send}
              titulo="Cobrança enviada"
              tone={enviadaAoBanco ? "done" : "pending"}
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
                  : motivoNaoEnviada
              }
            />

            <Linha
              icon={CheckCircle2}
              titulo={infoPagamentoManual ? "Pagamento registrado manualmente" : "Pagamento identificado pelo sistema"}
              tone={paga ? "done" : "pending"}
              valor={
                paga
                  ? infoPagamentoManual
                    ? formatarDataHora(infoPagamentoManual.data) || formatarDataHora(receita.dataPagamento)
                    : formatarDataHora(receita.confirmacaoPagtoEnviadaEm || receita.dataPagamento)
                  : "Ainda não identificado"
              }
              detalhe={
                paga
                  ? infoPagamentoManual
                    ? `Por ${infoPagamentoManual.usuarioNome || "Sistema"}${nasceuPaga ? " -- na criação da cobrança" : " -- numa edição"}${receita.dataPagamento ? ` -- data de pagamento informada: ${formatarDataHora(receita.dataPagamento)}` : ""}`
                    : receita.dataPagamento
                      ? `Pago em ${formatarDataHora(receita.dataPagamento)}`
                      : null
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

          <div className="mt-10 pt-8 border-t border-[var(--border-token)]">

            <div className="flex items-center gap-2 mb-5">
              <ScrollText size={18} className="text-[var(--text-subtle)]" />
              <h3 className="text-base font-bold text-[var(--text)]">
                Linha do tempo completa
              </h3>
            </div>

            {carregando ? (

              <p className="text-sm text-[var(--text-faint)]">Carregando...</p>

            ) : eventos.length ? (

              <div>
                {eventos.map((evento, indice) => (
                  <RegistroDeProcesso
                    key={`${evento.titulo}-${evento.data}-${indice}`}
                    evento={evento}
                    ultimo={indice === eventos.length - 1}
                  />
                ))}
              </div>

            ) : (

              <p className="text-sm text-[var(--text-faint)]">
                Nenhum processo registrado ainda pra essa cobrança.
              </p>

            )}

          </div>

        </div>
      </div>
    </div>
  );

}
