"use client";

import { useState } from "react";

import { exportarPDF, exportarExcel } from "@/utils/exportar";

import { UnidadeService } from "@/services/unidades.service";
import { KitnetService } from "@/services/kitnets.service";
import { LocadorService } from "@/services/locadores.service";
import { InquilinoService } from "@/services/inquilinos.service";
import { ContratoService } from "@/services/contratos.service";
import { SolicitacaoService } from "@/services/solicitacao.service";
import { VistoriaService } from "@/services/vistoria.service";
import { ReceitaService, DespesaService } from "@/services/financeiro.service";

function paraLista(resposta) {
  return Array.isArray(resposta)
    ? resposta
    : resposta?.data || [];
}

async function coletarResumo() {

  const [
    unidades,
    kitnets,
    locadores,
    inquilinos,
    contratos,
    solicitacoes,
    vistorias,
    receitas,
    despesas,
  ] = await Promise.all([
    UnidadeService.listar().then(paraLista).catch(() => []),
    KitnetService.listar().then(paraLista).catch(() => []),
    LocadorService.listar().then(paraLista).catch(() => []),
    InquilinoService.listar().then(paraLista).catch(() => []),
    ContratoService.listar().then(paraLista).catch(() => []),
    SolicitacaoService.listar().then(paraLista).catch(() => []),
    VistoriaService.listar().then(paraLista).catch(() => []),
    ReceitaService.listar().then(paraLista).catch(() => []),
    DespesaService.listar().then(paraLista).catch(() => []),
  ]);

  return [
    ["Residências", unidades.length],
    ["Kitnets", kitnets.length],
    ["Locadores", locadores.length],
    ["Inquilinos", inquilinos.length],
    ["Contratos", contratos.length],
    ["Solicitações", solicitacoes.length],
    ["Vistorias", vistorias.length],
    ["Receitas", receitas.length],
    ["Despesas", despesas.length],
  ];

}

export default function RelatorioExportar() {

  const [gerando, setGerando] =
    useState(false);

  async function handleExportarPDF() {

    setGerando(true);

    try {

      const linhas = await coletarResumo();

      exportarPDF({
        titulo: "Resumo Geral do Sistema",
        secoes: [
          {
            colunas: ["Módulo", "Total de Registros"],
            linhas,
          },
        ],
        nomeArquivo: "resumo-geral",
      });

    } catch (err) {

      alert(err.message || "Erro ao gerar PDF.");

    } finally {

      setGerando(false);

    }

  }

  async function handleExportarExcel() {

    setGerando(true);

    try {

      const linhas = await coletarResumo();

      exportarExcel({
        abas: [
          {
            nome: "Resumo Geral",
            colunas: ["Módulo", "Total de Registros"],
            linhas,
          },
        ],
        nomeArquivo: "resumo-geral",
      });

    } catch (err) {

      alert(err.message || "Erro ao gerar Excel.");

    } finally {

      setGerando(false);

    }

  }

  function imprimir() {

    window.print();

  }

  return (

    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

      <h2 className="text-2xl font-bold text-white mb-6">

        Exportações

      </h2>

      <p className="text-gray-400 -mt-4 mb-6">
        Resumo geral com o total de registros de cada módulo do sistema.
      </p>

      <div className="grid md:grid-cols-3 gap-6">

        <button
          onClick={handleExportarPDF}
          disabled={gerando}
          className="
            bg-green-700
            hover:bg-green-800
            disabled:opacity-50
            text-white
            rounded-2xl
            p-5
            transition
          "
        >

          {gerando ? "Gerando..." : "Exportar PDF"}

        </button>

        <button
          onClick={handleExportarExcel}
          disabled={gerando}
          className="
            bg-green-700
            hover:bg-green-800
            disabled:opacity-50
            text-white
            rounded-2xl
            p-5
            transition
          "
        >

          {gerando ? "Gerando..." : "Exportar Excel"}

        </button>

        <button
          onClick={imprimir}
          className="
            bg-gray-800
            hover:bg-black
            text-white
            rounded-2xl
            p-5
            transition
          "
        >

          Imprimir

        </button>

      </div>

    </div>

  );

}
