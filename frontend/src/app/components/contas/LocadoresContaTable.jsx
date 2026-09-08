"use client";

import { useEffect, useState } from "react";

import { LocadorService } from "../../../services/locadores.service";
import { ContaPagamentoService } from "../../../services/contaPagamento.service";
import { usePermissao } from "../../../hooks/usePermissao";

import { Users } from "lucide-react";

export default function LocadoresContaTable() {

  const podeEditar = usePermissao("asaasConfig.editar");

  const [locadores, setLocadores] = useState([]);
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvandoId, setSalvandoId] = useState(null);

  async function carregar() {
    try {
      setLoading(true);
      const [resLocadores, resContas] = await Promise.all([
        LocadorService.listar(),
        ContaPagamentoService.listar(),
      ]);

      setLocadores(Array.isArray(resLocadores) ? resLocadores : resLocadores.data || []);
      setContas(resContas.data || []);
    } catch (err) {
      console.error("Erro ao carregar locadores/contas:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function alterarConta(locador, contaPagamentoId) {
    setSalvandoId(locador.id);

    try {
      await LocadorService.atualizar(locador.id, { contaPagamentoId });
      await carregar();
    } catch (err) {
      alert(err.message || "Erro ao vincular a conta.");
    } finally {
      setSalvandoId(null);
    }
  }

  const contaPadrao = contas.find((c) => c.padrao);

  return (
    <div className="bg-[var(--surface)] backdrop-blur-[24px] rounded-2xl border border-[var(--border-token)] overflow-hidden">

      <div className="px-6 py-5 border-b border-[var(--border-token)]">
        <h2 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
          <Users size={20} />
          Locadores e suas contas
        </h2>
        <p className="text-sm text-[var(--text-subtle)] mt-1">
          Sem uma conta própria escolhida, as cobranças do locador saem pela conta padrão do sistema
          {contaPadrao ? ` (${contaPadrao.nome})` : " (nenhuma definida ainda)"}.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--surface-2)]">
            <tr>
              <th className="text-left p-4 text-[var(--text-muted)]">Locador</th>
              <th className="text-left p-4 text-[var(--text-muted)]">Conta usada</th>
            </tr>
          </thead>
          <tbody>

            {loading && (
              <tr>
                <td colSpan={2} className="p-8 text-center text-[var(--text-subtle)]">
                  Carregando...
                </td>
              </tr>
            )}

            {!loading && locadores.length === 0 && (
              <tr>
                <td colSpan={2} className="p-8 text-center text-[var(--text-subtle)]">
                  Nenhum locador cadastrado.
                </td>
              </tr>
            )}

            {!loading && locadores.map((locador) => (
              <tr key={locador.id} className="border-t border-[var(--border-token)]">
                <td className="p-4 font-semibold text-[var(--text)]">{locador.nome}</td>
                <td className="p-4">
                  <select
                    value={locador.contaPagamentoId || ""}
                    disabled={!podeEditar || salvandoId === locador.id}
                    onChange={(e) => alterarConta(locador, e.target.value)}
                    className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-lg p-2 disabled:opacity-50"
                  >
                    <option value="" className="bg-[#1b2430]">
                      Conta padrão do sistema{contaPadrao ? ` (${contaPadrao.nome})` : ""}
                    </option>
                    {contas.map((conta) => (
                      <option key={conta.id} value={conta.id} className="bg-[#1b2430]">
                        {conta.nome}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

    </div>
  );
}
