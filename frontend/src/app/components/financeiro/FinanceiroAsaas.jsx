"use client";

import { useEffect, useState } from "react";
import { Landmark, QrCode, ChevronDown, ChevronUp } from "lucide-react";

import Table from "../ui/Table";
import { ContaPagamentoService } from "../../../services/contaPagamento.service";

function mesAtual() {
  return new Date().toISOString().slice(0, 7);
}

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function formatarData(valor) {
  if (!valor) return "-";
  try {
    return new Date(valor).toLocaleDateString("pt-BR");
  } catch {
    return "-";
  }
}

function formatarDataHora(valor) {
  if (!valor) return "-";
  try {
    return new Date(valor).toLocaleString("pt-BR");
  } catch {
    return "-";
  }
}

// Painel principal -- "quanto essa conta recebeu", pelas Receitas de
// verdade do sistema (funciona pra qualquer provider: BB, Asaas, EFI,
// BRB, todos marcam qual conta processou quando enviam a cobrança).
// Remonta (via `key` no pai, por conta+mês) toda vez que troca de
// conta/mês, então já nasce no estado "carregando" certo.
function RecebidoPainel({ contaId, mes }) {

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {

    let cancelado = false;

    ContaPagamentoService.recebido(contaId, mes)
      .then((resposta) => {
        if (!cancelado) setResultado(resposta.data);
      })
      .catch((err) => {
        if (!cancelado) setErro(err.message || "Erro ao consultar recebido.");
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
        <p className="text-sm text-[var(--text-subtle)]">Recebido nessa conta em {mes}</p>
        <p className="text-3xl font-bold text-[var(--text)] mt-1">{formatarMoeda(resultado.total)}</p>
        <p className="text-sm text-[var(--text-faint)] mt-1">
          {resultado.quantidade} cobrança{resultado.quantidade === 1 ? "" : "s"} paga{resultado.quantidade === 1 ? "" : "s"}
        </p>
      </div>

      {resultado.receitas?.length > 0 && (

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[var(--text-faint)] uppercase text-xs border-b border-[var(--border-token)]">
              <tr>
                <th className="text-left py-3">Pago em</th>
                <th className="text-left py-3">De onde veio</th>
                <th className="text-left py-3">Pagador</th>
                <th className="text-left py-3">Descrição</th>
                <th className="text-left py-3">Valor</th>
              </tr>
            </thead>
            <tbody>
              {resultado.receitas.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border-token)]">
                  <td className="py-3 text-[var(--text-subtle)]">{formatarData(item.dataPagamento)}</td>
                  <td className="py-3 text-[var(--text-subtle)]">
                    {item.unidade ? (
                      <span className="text-emerald-400">
                        {item.unidade}{item.kitnet ? ` · Kitnet ${item.kitnet}` : ""}
                      </span>
                    ) : (
                      <span className="text-[var(--text-faint)]">-</span>
                    )}
                  </td>
                  <td className="py-3 text-[var(--text-subtle)]">{item.pagador || "-"}</td>
                  <td className="py-3 text-[var(--text-subtle)]">{item.descricao}</td>
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

// Secundário, só pra EFI -- o que chegou DIRETO na conta via Pix,
// consultado na própria EFI (não no sistema). Serve pra conferir
// contra o painel de cima: se alguém mandar Pix fora de uma cobrança
// que o sistema gerou, só aparece aqui.
function ExtratoEfiConteudo({ contaId, mes }) {

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
    return <p className="text-[var(--text-subtle)]">Consultando na EFI...</p>;
  }

  if (erro) {
    return <p className="text-red-400 text-sm">{erro}</p>;
  }

  if (!resultado) return null;

  return (

    <>

      <p className="text-sm text-[var(--text-subtle)]">
        {formatarMoeda(resultado.total)} em {resultado.quantidade} Pix, direto na EFI
      </p>

      {resultado.pix?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[var(--text-faint)] uppercase text-xs border-b border-[var(--border-token)]">
              <tr>
                <th className="text-left py-3">Data/Hora</th>
                <th className="text-left py-3">Pagador</th>
                <th className="text-left py-3">De onde veio</th>
                <th className="text-left py-3">Valor</th>
              </tr>
            </thead>
            <tbody>
              {resultado.pix.map((item, index) => (
                <tr key={item.endToEndId || index} className="border-b border-[var(--border-token)]">
                  <td className="py-3 text-[var(--text-subtle)]">{formatarDataHora(item.horario)}</td>
                  <td className="py-3 text-[var(--text-subtle)]">{item.pagador?.nome || "-"}</td>
                  <td className="py-3 text-[var(--text-subtle)]">
                    {item.inquilinoVinculado ? (
                      <span className="text-emerald-400">
                        {item.inquilinoVinculado.unidade || "-"}
                        {item.inquilinoVinculado.kitnet ? ` · Kitnet ${item.inquilinoVinculado.kitnet}` : ""}
                      </span>
                    ) : (
                      <span className="text-[var(--text-faint)]">Pix não identificado</span>
                    )}
                  </td>
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

function ExtratoEfiPainel({ contaId, mes }) {

  const [aberto, setAberto] = useState(false);

  return (

    <div className="border-t border-[var(--border-token)] pt-4">

      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-violet-200"
      >
        Ver extrato direto na EFI (Pix)
        {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {aberto && (

        <div className="mt-4 space-y-4">

          <ExtratoEfiConteudo key={`${contaId}-${mes}`} contaId={contaId} mes={mes} />

        </div>

      )}

    </div>

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

        setContas(todas);
        if (todas.length > 0) setContaSelecionadaId(todas[0].id);
      } catch (err) {
        console.error("Erro ao carregar contas:", err);
      } finally {
        setCarregandoContas(false);
      }
    }

    carregar();

  }, []);

  const contaSelecionada = contas.find((c) => c.id === contaSelecionadaId);

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
              Quanto cada conta bancária recebeu, mês a mês -- um locador com várias contas (ex.: SH com BB-H, BB-S e Efí) vê aqui separado por conta.
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
              Nenhuma conta cadastrada ainda.
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
              <RecebidoPainel key={`${contaSelecionadaId}-${mes}`} contaId={contaSelecionadaId} mes={mes} />
            )}

            {contaSelecionada?.provider === "EFI" && (
              <ExtratoEfiPainel key={`efi-${contaSelecionadaId}-${mes}`} contaId={contaSelecionadaId} mes={mes} />
            )}

          </div>

        )}

      </div>

    </Table>

  );

}
