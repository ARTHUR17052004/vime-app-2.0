"use client";

import { useEffect, useState } from "react";
import { Landmark, QrCode } from "lucide-react";

import Table from "../ui/Table";
import { ContaPagamentoService } from "../../../services/contaPagamento.service";

function mesAtual() {
  return new Date().toISOString().slice(0, 7);
}

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function formatarDataHora(valor) {
  if (!valor) return "-";
  try {
    return new Date(valor).toLocaleString("pt-BR");
  } catch {
    return "-";
  }
}

// Contas que só recebem (sem gerar cobrança pelo sistema, ver EFI) não
// têm Receita nenhuma no Financeiro -- essa aba é o lugar pra ver
// "quanto entrou" nelas, separado de Receitas/Despesas de verdade.
// Hoje só a EFI tem esse extrato; outro provider com o mesmo recurso
// entra aqui sozinho (é só ter extratoPix no backend).
const PROVIDERS_COM_EXTRATO = ["EFI"];

// Painel do extrato em si -- remonta (via `key` no pai, por conta+mês)
// toda vez que o usuário troca de conta ou de mês, então já nasce no
// estado "carregando" certo sem precisar de um efeito só pra avisar
// que começou a buscar.
function ExtratoPainel({ contaId, mes }) {

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {

    let cancelado = false;

    ContaPagamentoService.extratoPix(contaId, mes)
      .then((resposta) => {
        if (!cancelado) setResultado(resposta.data);
      })
      .catch((err) => {
        if (!cancelado) setErro(err.message || "Erro ao consultar extrato.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => { cancelado = true; };

  }, [contaId, mes]);

  if (carregando) {
    return <p className="text-[var(--text-subtle)]">Consultando...</p>;
  }

  if (erro) {
    return <p className="text-red-400 text-sm">{erro}</p>;
  }

  if (!resultado) return null;

  return (

    <>

      <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-6">
        <p className="text-sm text-[var(--text-subtle)]">Recebido via Pix em {mes}</p>
        <p className="text-3xl font-bold text-[var(--text)] mt-1">{formatarMoeda(resultado.total)}</p>
        <p className="text-sm text-[var(--text-faint)] mt-1">
          {resultado.quantidade} transação{resultado.quantidade === 1 ? "" : "ões"}
        </p>
      </div>

      {resultado.pix?.length > 0 && (

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[var(--text-faint)] uppercase text-xs border-b border-[var(--border-token)]">
              <tr>
                <th className="text-left py-3">Data/Hora</th>
                <th className="text-left py-3">Pagador</th>
                <th className="text-left py-3">Valor</th>
              </tr>
            </thead>
            <tbody>
              {resultado.pix.map((item, index) => (
                <tr key={item.endToEndId || index} className="border-b border-[var(--border-token)]">
                  <td className="py-3 text-[var(--text-subtle)]">{formatarDataHora(item.horario)}</td>
                  <td className="py-3 text-[var(--text-subtle)]">{item.pagador?.nome || "-"}</td>
                  <td className="py-3 font-semibold text-emerald-400">{formatarMoeda(item.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      )}

    </>

  );

}

export default function FinanceiroAsaas() {

  const [contas, setContas] = useState([]);
  const [carregandoContas, setCarregandoContas] = useState(true);
  const [contaSelecionadaId, setContaSelecionadaId] = useState(null);
  const [mes, setMes] = useState(mesAtual());

  useEffect(() => {

    async function carregar() {
      try {
        const resposta = await ContaPagamentoService.listar();
        const todas = resposta.data || [];
        const comExtrato = todas.filter((c) => PROVIDERS_COM_EXTRATO.includes(c.provider));

        setContas(comExtrato);
        if (comExtrato.length > 0) setContaSelecionadaId(comExtrato[0].id);
      } catch (err) {
        console.error("Erro ao carregar contas:", err);
      } finally {
        setCarregandoContas(false);
      }
    }

    carregar();

  }, []);

  return (

    <Table>

      <div className="px-6 pt-6">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <QrCode className="w-6 h-6 text-violet-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">Extratos</h2>
            <p className="text-[var(--text-subtle)]">
              Contas que só recebem (não geram cobrança pelo sistema) -- sem isso virar Receita no Financeiro.
            </p>
          </div>

        </div>

      </div>

      <div className="p-6">

        {carregandoContas && (
          <p className="text-[var(--text-subtle)] text-center py-10">Carregando contas...</p>
        )}

        {!carregandoContas && contas.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <Landmark className="w-8 h-8 text-[var(--text-faint)] mx-auto" />
            <p className="text-[var(--text-subtle)]">
              Nenhuma conta de recebimento (ex.: Efí) cadastrada ainda.
            </p>
            <p className="text-[var(--text-faint)] text-sm">
              Cadastre uma em Contas -- ela aparece aqui sozinha.
            </p>
          </div>
        )}

        {!carregandoContas && contas.length > 0 && (

          <div className="space-y-6">

            <div className="flex flex-wrap items-end gap-4">

              {contas.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {contas.map((conta) => (
                    <button
                      key={conta.id}
                      type="button"
                      onClick={() => setContaSelecionadaId(conta.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                        contaSelecionadaId === conta.id
                          ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                          : "border-[var(--border-token)] text-[var(--text-subtle)] hover:bg-[var(--surface-2)]"
                      }`}
                    >
                      {conta.nome}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs text-[var(--text-faint)] mb-1.5">Mês</label>
                <input
                  type="month"
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl px-3 py-2 text-sm"
                />
              </div>

            </div>

            {contaSelecionadaId && (
              <ExtratoPainel key={`${contaSelecionadaId}-${mes}`} contaId={contaSelecionadaId} mes={mes} />
            )}

          </div>

        )}

      </div>

    </Table>

  );

}
