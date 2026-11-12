"use client";

import { useState } from "react";

// Trava de "quebra de contrato" -- esvaziar a kitnet (excluir
// inquilino), excluir/encerrar contrato ou excluir kitnet ANTES do
// dataFim do contrato (ver backend/middlewares/permissaoMiddleware.js:
// exigirConfirmacaoTerminoAntecipado). Dois passos, como pedido: 1)
// motivo (fixo) + observação (livre); 2) só a senha, pra confirmar.
//
// `acao(dados)` é chamado com { motivoTerminoAntecipado,
// observacaoTerminoAntecipado, senhaConfirmacao } e deve lançar o erro
// de volta se a senha estiver errada (o modal mantém o passo 2 aberto
// pra tentar de novo, sem perder motivo/observação já digitados).
export default function TerminoAntecipadoModal({ isOpen, onClose, titulo, contexto, acao }) {

  const [passo, setPasso] = useState(1);
  const [motivo, setMotivo] = useState("");
  const [observacao, setObservacao] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!isOpen) return null;

  const fechar = () => {
    setPasso(1);
    setMotivo("");
    setObservacao("");
    setSenha("");
    setErro("");
    onClose?.();
  };

  const avancar = (e) => {

    e.preventDefault();

    if (!motivo) {
      setErro("Selecione o motivo.");
      return;
    }

    if (!observacao.trim()) {
      setErro("Escreva a observação.");
      return;
    }

    setErro("");
    setPasso(2);

  };

  const confirmar = async (e) => {

    e.preventDefault();

    if (!senha) {
      setErro("Digite sua senha pra confirmar.");
      return;
    }

    setErro("");
    setEnviando(true);

    try {

      await acao?.({
        motivoTerminoAntecipado: motivo,
        observacaoTerminoAntecipado: observacao,
        senhaConfirmacao: senha,
      });

      fechar();

    } catch (err) {

      setErro(err.message || "Erro ao confirmar.");

    } finally {

      setEnviando(false);

    }

  };

  return (

    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">

      {passo === 1 ? (

        <form
          onSubmit={avancar}
          autoComplete="off"
          className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[var(--surface)] p-7 space-y-5"
        >

          <h3 className="text-xl font-bold text-red-400">
            {titulo || "Quebra de contrato"}
          </h3>

          <p className="text-sm text-[var(--text-muted)]">
            {contexto || "Essa ação acontece antes do fim do contrato (dataFim)."} Isso conta como
            quebra de contrato -- selecione o motivo e escreva uma observação pra continuar.
          </p>

          <div>
            <label className="block text-xs text-[var(--text-faint)] mb-1.5">
              Motivo
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full"
            >
              <option value="" className="bg-[#1b2430]">Selecione...</option>
              <option value="ABANDONO" className="bg-[#1b2430]">Abandono</option>
              <option value="INADIMPLENCIA" className="bg-[#1b2430]">Inadimplência</option>
              <option value="QUEBRA_DO_INQUILINO" className="bg-[#1b2430]">Quebra do inquilino</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-faint)] mb-1.5">
              Observação
            </label>
            <textarea
              name="observacaoTerminoAntecipado"
              autoComplete="off"
              rows={3}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Descreva o que aconteceu..."
              className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full resize-none"
            />
          </div>

          {erro && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {erro}
            </div>
          )}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={fechar}
              className="px-5 py-2.5 rounded-xl border border-[var(--border-token)] text-[var(--text-muted)]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold"
            >
              Avançar
            </button>

          </div>

        </form>

      ) : (

        <form
          onSubmit={confirmar}
          autoComplete="off"
          className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[var(--surface)] p-7 space-y-5"
        >

          <h3 className="text-xl font-bold text-red-400">
            Confirme com sua senha
          </h3>

          <p className="text-sm text-[var(--text-muted)]">
            Digite sua senha pra confirmar a quebra de contrato.
          </p>

          <div>
            <label className="block text-xs text-[var(--text-faint)] mb-1.5">
              Sua senha
            </label>
            <input
              type="password"
              name="senhaConfirmacaoTerminoAntecipado"
              autoComplete="new-password"
              autoFocus
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full"
            />
          </div>

          {erro && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {erro}
            </div>
          )}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={() => setPasso(1)}
              className="px-5 py-2.5 rounded-xl border border-[var(--border-token)] text-[var(--text-muted)]"
            >
              Voltar
            </button>

            <button
              type="submit"
              disabled={enviando}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-60"
            >
              {enviando ? "Confirmando..." : "Confirmar"}
            </button>

          </div>

        </form>

      )}

    </div>

  );
}
