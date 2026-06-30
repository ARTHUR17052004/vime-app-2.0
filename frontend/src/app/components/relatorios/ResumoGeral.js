"use client";

import { useEffect, useState } from "react";

export default function ResumoGeral() {

  const [cards, setCards] =
    useState([]);

  useEffect(() => {

    const unidades =
      JSON.parse(
        localStorage.getItem("vime-unidades") || "[]"
      ).length;

    const kitnets =
      JSON.parse(
        localStorage.getItem("vime-kitnets") || "[]"
      ).length;

    const locadores =
      JSON.parse(
        localStorage.getItem("vime-locadores") || "[]"
      ).length;

    const inquilinos =
      JSON.parse(
        localStorage.getItem("vime-inquilinos") || "[]"
      ).length;

    const contratos =
      JSON.parse(
        localStorage.getItem("vime-contratos") || "[]"
      ).length;

    const solicitacoes =
      JSON.parse(
        localStorage.getItem("vime-solicitacoes") || "[]"
      ).length;

    const vistorias =
      JSON.parse(
        localStorage.getItem("vime-vistorias") || "[]"
      ).length;

    const financeiro =
      JSON.parse(
        localStorage.getItem("vime-financeiro") || "[]"
      ).length;

    setCards([

      {
        titulo: "Unidades",
        valor: unidades,
      },

      {
        titulo: "Kitnets",
        valor: kitnets,
      },

      {
        titulo: "Locadores",
        valor: locadores,
      },

      {
        titulo: "Inquilinos",
        valor: inquilinos,
      },

      {
        titulo: "Contratos",
        valor: contratos,
      },

      {
        titulo: "Solicitações",
        valor: solicitacoes,
      },

      {
        titulo: "Vistorias",
        valor: vistorias,
      },

      {
        titulo: "Financeiro",
        valor: financeiro,
      },

    ]);

  }, []);

  return (

    <div className="grid md:grid-cols-4 gap-6 mb-8">

      {cards.map((card) => (

        <div
          key={card.titulo}
          className="bg-white rounded-3xl shadow border p-6"
        >

          <p className="text-gray-500">
            {card.titulo}
          </p>

          <h2 className="text-4xl font-bold text-green-700 mt-3">
            {card.valor}
          </h2>

        </div>

      ))}

    </div>

  );

}