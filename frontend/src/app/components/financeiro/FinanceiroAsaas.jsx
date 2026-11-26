"use client";

import { useEffect, useState } from "react";
import { Landmark, QrCode, ChevronDown, ChevronUp, FileSpreadsheet } from "lucide-react";

import Table from "../ui/Table";
import { ContaPagamentoService } from "../../../services/contaPagamento.service";
import { exportarExcel } from "../../../utils/exportar";
import { usePermissao } from "../../../hooks/usePermissao";

function mesAtual() {
  return new Date().toISOString().slice(0, 7);
}

// Monta a linha do Relatório de Receitas (modelo do contador): Valor
// aluguel + Juros/multa - Tarifa boleto - Dedução + Excedentes = Valor
// final. Ver contaPagamentoService.recebidoDoMes (backend) pra origem
// de cada campo bruto.
//
// Valor aluguel vem do aluguel NOMINAL do contrato/kitnet
// (valorAluguelContrato), não da Descrição -- a Descrição padrão de
// toda receita recorrente é só "Aluguel - MM/AAAA" (sem valor nenhum
// escrito), então tentar ler um valor dali confundia o "11" do mês com
// reais (bug encontrado em 24/11/2026). Excedentes = o que foi cobrado
// a mais que esse aluguel nominal (ex.: energia/água extra cobrados
// junto no mesmo boleto).
//
// Juros/multa usa o valor REAL confirmado pelo provedor
// (valorMultaRecebida/valorJurosRecebido) sempre que disponível --
// só cai pro cálculo ESTIMADO (taxa x dias de atraso) quando nenhum
// dos dois foi confirmado ainda (receita antiga, ou provedor que não
// devolve isso pro nosso sistema). O estimado usa jurosValor/
// multaValor da Receita, que são só a TAXA (%) configurada pro banco
// calcular em caso de atraso -- multa é percentual fixo (aplicado uma
// vez, se atrasou), juros é taxa MENSAL proporcional aos dias corridos
// entre vencimento e pagamento (mesma convenção configurada no
// boleto, ver BBApi.criarBoleto no backend). Ver diasDeAtraso/
// montarLinhaRelatorio abaixo.
function diasDeAtraso(vencimento, dataPagamento) {
  if (!vencimento || !dataPagamento) return 0;
  const umDia = 24 * 60 * 60 * 1000;
  const dias = Math.floor((new Date(dataPagamento) - new Date(vencimento)) / umDia);
  return Math.max(0, dias);
}

function montarLinhaRelatorio(item, taxaBoletoValor) {

  const valorAluguel = item.valorAluguelContrato ?? item.valorBruto;
  const excedentes = item.valorAluguelContrato != null
    ? Math.max(0, item.valorBruto - item.valorAluguelContrato)
    : 0;

  // Prioridade pro valor REAL que o banco/provedor confirmou ter
  // cobrado (ver contaPagamentoService.recebidoDoMes) -- só cai pro
  // cálculo ESTIMADO por taxa x dias de atraso quando nenhum dos dois
  // foi confirmado ainda (receita antiga, ou provedor que não devolve
  // isso). Bug real encontrado em 25/11/2026: o estimado cobrava
  // R$90,30 de juros/multa de um pagamento que o BB confirmou não ter
  // cobrado NADA (1 dia de atraso só na compensação do boleto, sem
  // multa/juros de verdade).
  const temValorConfirmado = item.valorMultaRecebida != null || item.valorJurosRecebido != null;

  let jurosMulta;

  if (temValorConfirmado) {
    jurosMulta = Number(item.valorMultaRecebida || 0) + Number(item.valorJurosRecebido || 0);
  } else {
    const atraso = diasDeAtraso(item.vencimento, item.dataPagamento);
    const multa = atraso > 0 ? item.valorBruto * (Number(item.multaValor || 0) / 100) : 0;
    const juros = atraso > 0 ? item.valorBruto * (Number(item.jurosValor || 0) / 100) * (atraso / 30) : 0;
    jurosMulta = multa + juros;
  }

  const tarifaBoleto = Number(taxaBoletoValor || 0);
  // Dedução é do INQUILINO (pode variar de um pro outro) -- sem valor
  // próprio definido, cai pro padrão do locador da kitnet.
  const deducao = item.valorDeducaoInquilino ?? item.taxaAdministracaoLocador ?? 0;

  const valorFinal = valorAluguel + jurosMulta - tarifaBoleto - deducao + excedentes;

  // Período = os dois (pedido do usuário em 25/11/2026): mês de
  // referência da cobrança (vem do próprio vencimento -- toda receita
  // recorrente vence no mês a que se refere) + vigência do contrato
  // por trás (início/fim), quando tiver um.
  const mesReferencia = item.vencimento
    ? new Date(item.vencimento).toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric", timeZone: "UTC" })
    : "-";

  const vigenciaContrato = item.contratoDataInicio
    ? `${formatarData(item.contratoDataInicio)} a ${item.contratoDataFim ? formatarData(item.contratoDataFim) : "-"}`
    : "-";

  return {
    nossoNumero: item.nossoNumero || "-",
    cpf: item.cpf || "-",
    pagador: item.pagador || "-",
    // Coluna "Pagamento" = quando o dinheiro CAIU na conta
    // (dataCredito), não quando o inquilino pagou (dataPagamento) --
    // no BB esses dois dias podem divergir (compensação de boleto).
    // Sem dataCredito ainda confirmada pelo banco, cai pra
    // dataPagamento mesmo (Pix/Asaas sempre são iguais).
    dataPagamento: item.dataCredito ?? item.dataPagamento,
    unidadeKitnet: [item.unidade, item.kitnet ? `Kitnet ${item.kitnet}` : null].filter(Boolean).join(" - ") || "-",
    enderecoCompleto: item.enderecoCompleto || "-",
    cep: item.cep || "-",
    mesReferencia,
    vigenciaContrato,
    valorAluguel,
    jurosMulta,
    tarifaBoleto,
    deducao,
    excedentes,
    valorFinal,
  };

}

function formatarMoeda(valor) {
  // maximumFractionDigits explícito -- sem isso o toLocaleString deixa
  // passar um 3º dígito decimal quando o valor tem dízima (ex.: juros
  // estimado por dias de atraso), tipo "R$ 73,487" em vez de "R$ 73,49".
  return `R$ ${Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  const podeExportar = usePermissao("financeiro.exportar");

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

  function exportarRelatorioReceitas() {

    const linhas = (resultado.receitas || []).map((item) =>
      montarLinhaRelatorio(item, resultado.taxaBoletoValor)
    );

    // Cada conta é de um provedor só -- basta olhar o primeiro item
    // pra saber se esse relatório inteiro é da Asaas. Modelo próprio
    // pedido pela Asaas (pedido do usuário em 26/11/2026): sem a
    // coluna Excedentes (não existe esse caso lá) e "Pagamento" vira
    // "Data de Recebimento" (deixa explícito que é o dia que o
    // dinheiro caiu na conta, não o dia que o inquilino pagou -- ver
    // comentário de montarLinhaRelatorio acima sobre dataCredito).
    const ehAsaas = resultado.receitas?.[0]?.gatewayProvider === "ASAAS";

    const colunas = [
      "Nosso nº", ehAsaas ? "Data de Recebimento" : "Pagamento", "CPF", "Locatário",
      "Unidade/Kitnet", "Endereço", "CEP", "Mês referência", "Vigência do contrato",
      "Valor aluguel", "Juros / mult", "Tarifa boleto", "Dedução",
      ...(ehAsaas ? [] : ["Excedentes"]),
      "Valor final",
    ];

    const soma = (campo) => linhas.reduce((total, l) => total + Number(l[campo] || 0), 0);

    const linhaPlanilha = (l) => [
      l.nossoNumero,
      formatarData(l.dataPagamento),
      l.cpf,
      l.pagador,
      l.unidadeKitnet,
      l.enderecoCompleto,
      l.cep,
      l.mesReferencia,
      l.vigenciaContrato,
      formatarMoeda(l.valorAluguel),
      formatarMoeda(l.jurosMulta),
      formatarMoeda(l.tarifaBoleto),
      formatarMoeda(l.deducao),
      ...(ehAsaas ? [] : [formatarMoeda(l.excedentes)]),
      formatarMoeda(l.valorFinal),
    ];

    exportarExcel({
      abas: [{
        nome: "Receitas",
        colunas,
        linhas: [
          ...linhas.map(linhaPlanilha),
          [],
          linhaPlanilha({
            cpf: "", pagador: "Total", unidadeKitnet: "", enderecoCompleto: "", cep: "",
            mesReferencia: "", vigenciaContrato: "",
            valorAluguel: soma("valorAluguel"),
            jurosMulta: soma("jurosMulta"),
            tarifaBoleto: soma("tarifaBoleto"),
            deducao: soma("deducao"),
            excedentes: soma("excedentes"),
            valorFinal: soma("valorFinal"),
          }),
        ],
      }],
      infoLinhas: [`Relatório de Receitas - ${resultado.contaNome || ""} - ${mes}`],
      nomeArquivo: `relatorio-receitas-${(resultado.contaNome || "conta").toLowerCase().replace(/\s+/g, "-")}`,
    });

  }

  return (

    <>

      <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-[var(--text-subtle)]">Recebido nessa conta em {mes}</p>
          <p className="text-3xl font-bold text-[var(--text)] mt-1">{formatarMoeda(resultado.total)}</p>
          <p className="text-sm text-[var(--text-faint)] mt-1">
            {resultado.quantidade} cobrança{resultado.quantidade === 1 ? "" : "s"} paga{resultado.quantidade === 1 ? "" : "s"}
          </p>
        </div>

        {podeExportar && resultado.receitas?.length > 0 && (
          <button
            type="button"
            onClick={exportarRelatorioReceitas}
            className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20 px-4 py-2.5 text-emerald-400 hover:bg-emerald-500/25 transition text-sm font-medium"
          >
            <FileSpreadsheet size={16} />
            Exportar Excel
          </button>
        )}
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
