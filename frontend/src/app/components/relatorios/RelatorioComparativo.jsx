"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Minus, Scale, FileDown, FileSpreadsheet } from "lucide-react";

import Card from "../ui/Card";
import Select from "../ui/Select";
import Input from "../ui/Input";
import Button from "../ui/Button";

import { CATALOGO_COMPARATIVOS } from "@/config/catalogoComparativos";
import { PRESETS_PERIODO, intervaloDoPreset } from "@/utils/periodos";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { exportarPDF, exportarExcel } from "@/utils/exportar";

const paraInputDate = (data) => (data ? new Date(data).toISOString().slice(0, 10) : "");

function SeletorPeriodo({ titulo, preset, setPreset, inicio, setInicio, fim, setFim }) {
  return (
    <div className="flex-1 min-w-[220px] space-y-3">

      <Select
        label={titulo}
        value={preset}
        onChange={(e) => setPreset(e.target.value)}
      >
        {PRESETS_PERIODO.map((p) => (
          <option key={p.chave} value={p.chave}>{p.rotulo}</option>
        ))}
      </Select>

      {preset === "PERSONALIZADO" && (
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" size="sm" value={paraInputDate(inicio)} onChange={(e) => setInicio(e.target.value ? new Date(e.target.value) : null)} />
          <Input type="date" size="sm" value={paraInputDate(fim)} onChange={(e) => setFim(e.target.value ? new Date(e.target.value) : null)} />
        </div>
      )}

    </div>
  );
}

function rotuloDoPeriodo(preset, inicio, fim) {
  if (preset !== "PERSONALIZADO") {
    return PRESETS_PERIODO.find((p) => p.chave === preset)?.rotulo || preset;
  }
  return inicio && fim ? `${formatDate(inicio)} a ${formatDate(fim)}` : "Personalizado";
}

function formatarValor(valor, formato) {
  return formato === "moeda" ? formatCurrency(valor) : String(valor ?? 0);
}

function Variacao({ a, b }) {

  if (a === 0 && b === 0) {
    return <span className="text-[var(--text-faint)]">—</span>;
  }

  if (a === 0) {
    return <span className="flex items-center gap-1 text-emerald-400"><ArrowUp size={14} /> novo</span>;
  }

  const variacao = ((b - a) / Math.abs(a)) * 100;
  const arredondado = Math.round(variacao * 10) / 10;

  if (arredondado === 0) {
    return <span className="flex items-center gap-1 text-[var(--text-subtle)]"><Minus size={14} /> 0%</span>;
  }

  const positivo = arredondado > 0;

  return (
    <span className={`flex items-center gap-1 font-semibold ${positivo ? "text-emerald-400" : "text-red-400"}`}>
      {positivo ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
      {positivo ? "+" : ""}{arredondado}%
    </span>
  );

}

export default function RelatorioComparativo({ podeExportar = true }) {

  const [metricaChave, setMetricaChave] = useState(CATALOGO_COMPARATIVOS[0]?.chave || "");

  const [presetA, setPresetA] = useState("ESTE_MES");
  const [inicioA, setInicioA] = useState(null);
  const [fimA, setFimA] = useState(null);

  const [presetB, setPresetB] = useState("MES_PASSADO");
  const [inicioB, setInicioB] = useState(null);
  const [fimB, setFimB] = useState(null);

  const [linhas, setLinhas] = useState(null);
  const [rotulos, setRotulos] = useState({ a: "", b: "" });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function comparar() {

    const metrica = CATALOGO_COMPARATIVOS.find((m) => m.chave === metricaChave);
    if (!metrica) return;

    const periodoA = presetA === "PERSONALIZADO" ? { inicio: inicioA, fim: fimA } : intervaloDoPreset(presetA);
    const periodoB = presetB === "PERSONALIZADO" ? { inicio: inicioB, fim: fimB } : intervaloDoPreset(presetB);

    if (!periodoA?.inicio || !periodoA?.fim || !periodoB?.inicio || !periodoB?.fim) {
      setErro("Escolha as duas datas do período personalizado antes de comparar.");
      return;
    }

    setCarregando(true);
    setErro("");

    try {

      const [resultadoA, resultadoB] = await Promise.all([
        metrica.calcular(periodoA.inicio, periodoA.fim),
        metrica.calcular(periodoB.inicio, periodoB.fim),
      ]);

      // As duas rodam a mesma função, então os rótulos vêm sempre na
      // mesma ordem -- junta pelo índice.
      const combinadas = resultadoA.map((linha, i) => ({
        rotulo: linha.rotulo,
        formato: linha.formato,
        valorA: linha.valor,
        valorB: resultadoB[i]?.valor ?? 0,
      }));

      setLinhas(combinadas);
      setRotulos({
        a: rotuloDoPeriodo(presetA, periodoA.inicio, periodoA.fim),
        b: rotuloDoPeriodo(presetB, periodoB.inicio, periodoB.fim),
      });

    } catch (err) {

      setErro(err.message || "Erro ao gerar o comparativo.");

    } finally {

      setCarregando(false);

    }

  }

  function exportar(formato) {

    if (!linhas) return;

    const metrica = CATALOGO_COMPARATIVOS.find((m) => m.chave === metricaChave);
    const colunas = ["Métrica", rotulos.a, rotulos.b];
    const corpo = linhas.map((l) => [
      l.rotulo,
      formatarValor(l.valorA, l.formato),
      formatarValor(l.valorB, l.formato),
    ]);

    const titulo = `${metrica.rotulo} -- ${rotulos.a} x ${rotulos.b}`;

    if (formato === "pdf") {
      exportarPDF({ titulo, secoes: [{ colunas, linhas: corpo }], nomeArquivo: "comparativo" });
    } else {
      exportarExcel({ abas: [{ nome: "Comparativo", colunas, linhas: corpo }], nomeArquivo: "comparativo" });
    }

  }

  return (

    <Card padding="md">

      <div className="flex items-center gap-3 mb-6">
        <Scale size={20} className="text-emerald-400" />
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">Relatórios Comparativos</h2>
          <p className="text-sm text-[var(--text-subtle)]">Compare dois períodos lado a lado.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-2">

        <div className="flex-1 min-w-[220px]">
          <Select
            label="Métrica"
            value={metricaChave}
            onChange={(e) => setMetricaChave(e.target.value)}
          >
            {CATALOGO_COMPARATIVOS.map((m) => (
              <option key={m.chave} value={m.chave}>{m.rotulo}</option>
            ))}
          </Select>
        </div>

      </div>

      <div className="flex flex-wrap gap-4 mb-6">

        <SeletorPeriodo
          titulo="Período A"
          preset={presetA} setPreset={setPresetA}
          inicio={inicioA} setInicio={setInicioA}
          fim={fimA} setFim={setFimA}
        />

        <SeletorPeriodo
          titulo="Período B"
          preset={presetB} setPreset={setPresetB}
          inicio={inicioB} setInicio={setInicioB}
          fim={fimB} setFim={setFimB}
        />

        <div className="flex items-end">
          <Button onClick={comparar} disabled={carregando}>
            {carregando ? "Comparando..." : "Comparar"}
          </Button>
        </div>

      </div>

      {erro && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
          {erro}
        </div>
      )}

      {linhas && (

        <div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--border-token)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-token)] bg-[var(--surface-2)]">
                  <th className="text-left px-4 py-3 text-[var(--text-subtle)] font-semibold">Métrica</th>
                  <th className="text-right px-4 py-3 text-[var(--text-subtle)] font-semibold">{rotulos.a}</th>
                  <th className="text-right px-4 py-3 text-[var(--text-subtle)] font-semibold">{rotulos.b}</th>
                  <th className="text-right px-4 py-3 text-[var(--text-subtle)] font-semibold">Variação</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.rotulo} className="border-b border-[var(--border-token)] last:border-b-0">
                    <td className="px-4 py-3 text-[var(--text)]">{l.rotulo}</td>
                    <td className="px-4 py-3 text-right text-[var(--text)] tabular-nums">{formatarValor(l.valorA, l.formato)}</td>
                    <td className="px-4 py-3 text-right text-[var(--text)] tabular-nums">{formatarValor(l.valorB, l.formato)}</td>
                    <td className="px-4 py-3 text-right tabular-nums"><Variacao a={l.valorA} b={l.valorB} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {podeExportar && (
            <div className="grid grid-cols-2 gap-3 mt-4 max-w-sm ml-auto">
              <button
                onClick={() => exportar("pdf")}
                className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-[var(--text)] py-3 rounded-2xl transition text-sm font-medium"
              >
                <FileDown size={15} /> PDF
              </button>
              <button
                onClick={() => exportar("excel")}
                className="flex items-center justify-center gap-2 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border-token)] text-[var(--text)] py-3 rounded-2xl transition text-sm font-medium"
              >
                <FileSpreadsheet size={15} /> Excel
              </button>
            </div>
          )}

        </div>

      )}

    </Card>

  );

}
