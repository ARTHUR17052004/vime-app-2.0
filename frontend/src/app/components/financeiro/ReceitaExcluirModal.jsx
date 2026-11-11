"use client";

import { useState } from "react";

// Mesma trava de senha+motivo que ReceitaForm.jsx usa pra mudar o
// valor do boleto (ver backend/middlewares/permissaoMiddleware.js:
// exigirConfirmacaoExclusao) -- excluir uma cobrança de vez também
// dispara aviso "EXCLUSÃO DE BOLETO" pra equipe inteira.
export default function ReceitaExcluirModal({ isOpen, onClose, receita, onConfirmar }) {

  const [motivoExclusao, setMotivoExclusao] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  if (!isOpen || !receita) return null;

  const fechar = () => {
    setMotivoExclusao("");
    setSenhaConfirmacao("");
    setErro("");
    onClose?.();
  };

  const confirmar = async (e) => {

    e.preventDefault();

    if (!motivoExclusao.trim()) {
      setErro("Digite o motivo da exclusão.");
      return;
    }

    if (!senhaConfirmacao) {
      setErro("Digite sua senha pra confirmar.");
      return;
    }

    setErro("");
    setExcluindo(true);

    try {

      await onConfirmar?.(receita.id, { motivoExclusao, senhaConfirmacao });

      fechar();

    } catch (err) {

      setErro(err.message || "Erro ao excluir receita.");

    } finally {

      setExcluindo(false);

    }

  };

  return (

    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">

      <form
        onSubmit={confirmar}
        className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[var(--surface)] p-7 space-y-5"
      >

        <h3 className="text-xl font-bold text-red-400">
          Confirmar exclusão
        </h3>

        <p className="text-sm text-[var(--text-muted)]">
          Você está excluindo "{receita.descricao}" (R$ {Number(receita.valor).toFixed(2)}) de vez --
          isso não pode ser desfeito. Digite o motivo e sua senha pra confirmar -- vai gerar um aviso pra equipe.
        </p>

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Motivo da exclusão
          </label>
          <input
            type="text"
            autoFocus
            value={motivoExclusao}
            onChange={(e) => setMotivoExclusao(e.target.value)}
            placeholder="Ex.: lançada em duplicidade, cadastro errado..."
            className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Sua senha
          </label>
          <input
            type="password"
            value={senhaConfirmacao}
            onChange={(e) => setSenhaConfirmacao(e.target.value)}
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
            onClick={fechar}
            className="px-5 py-2.5 rounded-xl border border-[var(--border-token)] text-[var(--text-muted)]"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={excluindo}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-60"
          >
            {excluindo ? "Excluindo..." : "Excluir"}
          </button>

        </div>

      </form>

    </div>

  );
}
