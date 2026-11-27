/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState } from "react";
import { Send, Mail, Clock, X, CheckCircle2, AlertCircle, Download, Repeat } from "lucide-react";

import Card from "../ui/Card";
import Select from "../ui/Select";
import Input from "../ui/Input";
import Button from "../ui/Button";

import { RelatorioService } from "@/services/relatorio.service";
import { ContaPagamentoService } from "@/services/contaPagamento.service";
import { formatDateTime } from "@/utils/formatDate";
import { mostrarBlobNaAba } from "@/utils/abrirArquivoBaixado";

// "Extrato de Receitas" (Financeiro > Extratos, FinanceiroAsaas.jsx) não
// é um relatório do catálogo genérico -- precisa de conta+mês, então
// fica como opção à parte aqui em cima (ver backend/src/services/
// relatorioEnvioService.js, chave reservada "EXTRATO_CONTA"), sempre em
// Excel (nunca teve PDF, mesmo de lá).
const CHAVE_EXTRATO_CONTA = "EXTRATO_CONTA";

const mesAtual = () => new Date().toISOString().slice(0, 7);

// Área de envio agendado de relatório por e-mail -- o admin escolhe um
// relatório do catálogo (mesmos cards de "Relatórios Disponíveis" logo
// acima), um destinatário e uma data/hora; o backend gera o arquivo e
// manda sozinho nessa hora (ver enviarRelatoriosAgendadosJob.js). Cada
// agendamento fica acumulado na lista abaixo, com status e quando foi
// enviado de verdade -- pedido do usuário em 26/11/2026: precisa dar
// pra diferenciar cada envio (relatório + destinatário + data).
const ROTULO_STATUS = {
  PENDENTE: { texto: "Pendente", cor: "text-amber-400", Icone: Clock },
  ENVIADO: { texto: "Enviado", cor: "text-emerald-400", Icone: CheckCircle2 },
  ERRO: { texto: "Erro", cor: "text-red-400", Icone: AlertCircle },
  CANCELADO: { texto: "Cancelado", cor: "text-[var(--text-faint)]", Icone: X },
};

const paraInputDatetime = (data) => {
  if (!data) return "";
  const d = new Date(data);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function RelatorioEnvio({ podeEnviar = true, podeCancelar = true }) {

  const [tipos, setTipos] = useState([]);
  const [contas, setContas] = useState([]);
  const [agendados, setAgendados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviandoForm, setEnviandoForm] = useState(false);
  const [cancelandoId, setCancelandoId] = useState(null);
  const [baixandoId, setBaixandoId] = useState(null);

  const [relatorioChave, setRelatorioChave] = useState("");
  const [formato, setFormato] = useState("pdf");
  const [destinatarioEmail, setDestinatarioEmail] = useState("");
  const [dataAgendada, setDataAgendada] = useState(paraInputDatetime(new Date()));
  const [contaPagamentoId, setContaPagamentoId] = useState("");
  const [mesReferencia, setMesReferencia] = useState(mesAtual());
  const [recorrente, setRecorrente] = useState(false);

  const ehExtratoConta = relatorioChave === CHAVE_EXTRATO_CONTA;

  async function carregar() {
    try {
      const [respostaTipos, respostaAgendados, respostaContas] = await Promise.all([
        RelatorioService.listarConfig(),
        RelatorioService.listarAgendados(),
        ContaPagamentoService.listar().catch(() => ({ data: [] })),
      ]);
      const ativos = (respostaTipos.data || []).filter((t) => t.ativo);
      setTipos(ativos);
      const listaContas = respostaContas.data || [];
      setContas(listaContas);
      if (!relatorioChave && ativos.length > 0) setRelatorioChave(ativos[0].chave);
      if (!contaPagamentoId && listaContas.length > 0) setContaPagamentoId(listaContas[0].id);
      setAgendados(respostaAgendados.data || []);
    } catch (err) {
      setErro(err.message || "Erro ao carregar o envio de relatórios.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function agendar(e) {

    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!relatorioChave || !destinatarioEmail || !dataAgendada) {
      setErro("Preencha o relatório, o e-mail de destino e a data de envio.");
      return;
    }

    if (ehExtratoConta && (!contaPagamentoId || !mesReferencia)) {
      setErro("Escolha a conta e o mês do extrato.");
      return;
    }

    setEnviandoForm(true);

    try {

      await RelatorioService.agendar({
        relatorioChave,
        formato: ehExtratoConta ? "excel" : formato,
        destinatarioEmail: destinatarioEmail.trim(),
        dataAgendada: new Date(dataAgendada).toISOString(),
        recorrente,
        ...(ehExtratoConta ? { contaPagamentoId, mesReferencia } : {}),
      });

      setSucesso(recorrente ? "Envio agendado, repetindo todo mês." : "Envio agendado.");
      setDestinatarioEmail("");
      await carregar();

    } catch (err) {

      setErro(err.message || "Erro ao agendar o envio.");

    } finally {

      setEnviandoForm(false);

    }

  }

  async function cancelar(id) {

    setErro("");
    setCancelandoId(id);

    try {
      await RelatorioService.cancelarAgendado(id);
      await carregar();
    } catch (err) {
      setErro(err.message || "Erro ao cancelar o envio.");
    } finally {
      setCancelandoId(null);
    }

  }

  // Aba aberta ANTES do fetch (ver abrirArquivoBaixado.js) -- mesmo
  // truque do "Baixar PDF" de Contratos, pra não ser bloqueado como
  // pop-up e funcionar em navegador mobile/PWA instalado.
  async function baixar(agendamento) {

    const aba = window.open("", "_blank");
    setErro("");
    setBaixandoId(agendamento.id);

    try {
      const blob = await RelatorioService.baixarAgendado(agendamento.id);
      mostrarBlobNaAba(aba, blob, { nomeArquivo: `${agendamento.relatorioTitulo}.${agendamento.formato === "pdf" ? "pdf" : "xlsx"}` });
    } catch (err) {
      aba?.close();
      setErro(err.message || "Erro ao baixar o relatório.");
    } finally {
      setBaixandoId(null);
    }

  }

  if (carregando) return null;

  return (

    <Card padding="lg">

      <div className="flex items-center gap-3 mb-2">
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5">
          <Mail size={18} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--text)]">Envio de Relatórios por E-mail</h3>
          <p className="text-sm text-[var(--text-subtle)]">Agende um relatório pra chegar no e-mail de alguém numa data/hora certa.</p>
        </div>
      </div>

      {podeEnviar && (

        <form onSubmit={agendar} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end mt-6">

          <div className="md:col-span-2">
            <Select
              label="Relatório"
              value={relatorioChave}
              onChange={(e) => setRelatorioChave(e.target.value)}
            >
              <option value={CHAVE_EXTRATO_CONTA}>Extrato de Receitas (por conta/mês)</option>
              {tipos.map((t) => (
                <option key={t.chave} value={t.chave}>{t.rotulo}</option>
              ))}
            </Select>
          </div>

          {ehExtratoConta ? (
            <>
              <div className="md:col-span-2">
                <Select
                  label="Conta de pagamento"
                  value={contaPagamentoId}
                  onChange={(e) => setContaPagamentoId(e.target.value)}
                >
                  {contas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </Select>
              </div>

              <Input
                label="Mês do extrato"
                type="month"
                value={mesReferencia}
                onChange={(e) => setMesReferencia(e.target.value)}
              />
            </>
          ) : (
            <Select
              label="Formato"
              value={formato}
              onChange={(e) => setFormato(e.target.value)}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </Select>
          )}

          <Input
            label="E-mail de destino"
            type="email"
            placeholder="nome@email.com"
            value={destinatarioEmail}
            onChange={(e) => setDestinatarioEmail(e.target.value)}
          />

          <Input
            label="Enviar em"
            type="datetime-local"
            value={dataAgendada}
            onChange={(e) => setDataAgendada(e.target.value)}
          />

          <div className="md:col-span-5 flex items-center justify-between gap-4 flex-wrap">

            <Button type="submit" leftIcon={<Send size={15} />} disabled={enviandoForm} loading={enviandoForm}>
              Agendar envio
            </Button>

            <label className="flex items-center gap-2 text-sm text-[var(--text-subtle)] cursor-pointer">
              <input
                type="checkbox"
                checked={recorrente}
                onChange={(e) => setRecorrente(e.target.checked)}
                className="rounded border-[var(--border-token)]"
              />
              Repetir todo mês (mesmo relatório, e-mail e dia)
            </label>

          </div>

        </form>

      )}

      {erro && <p className="text-sm text-red-400 mt-4">{erro}</p>}
      {sucesso && <p className="text-sm text-emerald-400 mt-4">{sucesso}</p>}

      <div className="mt-8 space-y-2">

        <h4 className="text-sm font-semibold text-[var(--text-muted)]">Fila e histórico de envios</h4>

        {agendados.length === 0 ? (

          <p className="text-sm text-[var(--text-faint)] py-4">Nenhum envio agendado ainda.</p>

        ) : (

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-faint)] border-b border-[var(--border-token)]">
                  <th className="py-2 pr-3 font-medium">Relatório</th>
                  <th className="py-2 pr-3 font-medium">Destinatário</th>
                  <th className="py-2 pr-3 font-medium">Formato</th>
                  <th className="py-2 pr-3 font-medium">Agendado para</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Enviado em</th>
                  <th className="py-2 pr-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {agendados.map((a) => {
                  const status = ROTULO_STATUS[a.status] || ROTULO_STATUS.PENDENTE;
                  const Icone = status.Icone;
                  return (
                    <tr key={a.id} className="border-b border-[var(--border-token)]/50">
                      <td className="py-2.5 pr-3 text-[var(--text)]">
                        <span className="flex items-center gap-1.5">
                          {a.relatorioTitulo}
                          {a.recorrente && (
                            <Repeat size={12} className="text-[var(--text-faint)]" title="Repete todo mês" />
                          )}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-[var(--text-subtle)]">{a.destinatarioEmail}</td>
                      <td className="py-2.5 pr-3 text-[var(--text-subtle)] uppercase">{a.formato}</td>
                      <td className="py-2.5 pr-3 text-[var(--text-subtle)]">{formatDateTime(a.dataAgendada)}</td>
                      <td className={`py-2.5 pr-3 font-medium ${status.cor}`}>
                        <span className="flex items-center gap-1.5">
                          <Icone size={14} />
                          {status.texto}
                        </span>
                        {a.status === "ERRO" && a.erro && (
                          <span className="block text-xs text-[var(--text-faint)] font-normal mt-0.5">{a.erro}</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-[var(--text-subtle)]">{a.enviadoEm ? formatDateTime(a.enviadoEm) : "-"}</td>
                      <td className="py-2.5 pr-3 text-right whitespace-nowrap">
                        {a.status === "ENVIADO" && (
                          <button
                            onClick={() => baixar(a)}
                            disabled={baixandoId === a.id}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium disabled:opacity-50 inline-flex items-center gap-1 mr-3"
                          >
                            <Download size={13} />
                            Baixar
                          </button>
                        )}
                        {podeCancelar && a.status === "PENDENTE" && (
                          <button
                            onClick={() => cancelar(a.id)}
                            disabled={cancelandoId === a.id}
                            className="text-xs text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        )}

      </div>

    </Card>

  );

}
