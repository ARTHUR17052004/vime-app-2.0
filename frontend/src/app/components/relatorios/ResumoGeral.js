"use client";

import { useEffect, useState } from "react";

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

export default function ResumoGeral() {

  const [cards, setCards] =
    useState([]);

  useEffect(() => {

    async function carregar() {

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

      setCards([

        {
          titulo: "Unidades",
          valor: unidades.length,
        },

        {
          titulo: "Kitnets",
          valor: kitnets.length,
        },

        {
          titulo: "Locadores",
          valor: locadores.length,
        },

        {
          titulo: "Inquilinos",
          valor: inquilinos.length,
        },

        {
          titulo: "Contratos",
          valor: contratos.length,
        },

        {
          titulo: "Solicitações",
          valor: solicitacoes.length,
        },

        {
          titulo: "Vistorias",
          valor: vistorias.length,
        },

        {
          titulo: "Financeiro",
          valor: receitas.length + despesas.length,
        },

      ]);

    }

    carregar();

  }, []);

  return (

    <div className="grid md:grid-cols-4 gap-6 mb-8">

      {cards.map((card) => (

        <div
          key={card.titulo}
          className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6"
        >

          <p className="text-gray-400">
            {card.titulo}
          </p>

          <h2 className="text-4xl font-bold text-green-400 mt-3">
            {card.valor}
          </h2>

        </div>

      ))}

    </div>

  );

}
