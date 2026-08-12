"use client";

import Link from "next/link";

export default function RelatorioCards() {

  const relatorios = [

    {
      nome: "Unidades",
      link: "/unidades",
    },

    {
      nome: "Kitnets",
      link: "/kitnets",
    },

    {
      nome: "Locadores",
      link: "/locadores",
    },

    {
      nome: "Inquilinos",
      link: "/inquilinos",
    },

    {
      nome: "Contratos",
      link: "/contratos",
    },

    {
      nome: "Solicitações",
      link: "/solicitacoes",
    },

    {
      nome: "Vistorias",
      link: "/vistorias",
    },

    {
      nome: "Financeiro",
      link: "/financeiro",
    },

  ];

  return (

    <div className="mb-8">

      <h2 className="text-2xl font-bold text-white mb-6">

        Relatórios Disponíveis

      </h2>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        {relatorios.map((item) => (

          <div
            key={item.nome}
            className="
              bg-gradient-to-br
              from-[#202a36]/95
              via-[#1b2430]/96
              to-[#151c25]/96
              backdrop-blur-xl
              border
              border-white/[0.07]
              rounded-3xl
              p-6
            "
          >

            <h3 className="text-xl font-bold text-white mb-6">

              {item.nome}

            </h3>

            <Link
              href={item.link}
              className="
                block
                w-full
                text-center
                bg-green-700
                text-white
                py-3
                rounded-2xl
                hover:bg-green-800
                transition
              "
            >

              Visualizar

            </Link>

          </div>

        ))}

      </div>

    </div>

  );

}