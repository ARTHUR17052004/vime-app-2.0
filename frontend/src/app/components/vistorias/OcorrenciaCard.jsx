"use client";

export default function OcorrenciaCard() {

  const ocorrencias = [

    {
      id: 1,
      titulo: "Telha quebrada",
      descricao:
        "Boa tarde, ontem com a chuva uma telha quebrou e molhou meu apartamento.",
      categoria: "Manutenção",
      morador: "Arthur",
      resposta:
        "Vamos enviar um colaborador para verificar.",
      status: "Em andamento",
    },

    {
      id: 2,
      titulo: "Vazamento de água",
      descricao:
        "Há um vazamento próximo ao registro.",
      categoria: "Manutenção",
      morador: "Debora",
      resposta:
        "Problema resolvido.",
      status: "Resolvida",
    },

  ];

  return (

    <div className="space-y-6">

      {ocorrencias.map((item) => (

        <div
          key={item.id}
          className="
            bg-gradient-to-br
            from-[#202a36]/95
            via-[#1b2430]/96
            to-[#151c25]/96
            backdrop-blur-xl
            border
            border-white/[0.07]
            rounded-3xl
            p-8
          "
        >

          <div className="flex justify-between items-start gap-8">

            <div className="flex-1">

              <h2 className="text-3xl font-bold text-white">
                {item.titulo}
              </h2>

              <div className="text-gray-200 mt-4 text-lg">
                {item.descricao}
              </div>

              <div className="mt-6 text-gray-400">
                {item.categoria}
              </div>

              <div className="text-gray-400">
                Morador: {item.morador}
              </div>

            </div>

            <select
              defaultValue={item.status}
              className="
                border
                border-white/10
                rounded-2xl
                p-3
                text-white
                bg-white/5
              "
            >

              <option value="Aberta">
                Aberta
              </option>

              <option value="Em andamento">
                Em andamento
              </option>

              <option value="Resolvida">
                Resolvida
              </option>

              <option value="Fechada">
                Fechada
              </option>

            </select>

          </div>

          <div
            className="
              bg-white/5
              rounded-2xl
              p-5
              mt-6
            "
          >

            <div className="text-gray-400 text-sm">
              Resposta da Administração
            </div>

            <div className="text-gray-200 mt-3 text-lg">
              {item.resposta}
            </div>

          </div>

          <button
            className="
              mt-6
              border
              border-white/10
              px-6
              py-3
              rounded-2xl
              hover:bg-white/5
              text-white
              font-medium
            "
          >
            Responder
          </button>

        </div>

      ))}

    </div>

  );

}