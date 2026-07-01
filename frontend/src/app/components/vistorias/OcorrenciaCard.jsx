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
            bg-white
            rounded-3xl
            shadow
            p-8
          "
        >

          <div className="flex justify-between items-start gap-8">

            <div className="flex-1">

              <h2 className="text-3xl font-bold text-gray-900">
                {item.titulo}
              </h2>

              <div className="text-gray-800 mt-4 text-lg">
                {item.descricao}
              </div>

              <div className="mt-6 text-gray-700">
                {item.categoria}
              </div>

              <div className="text-gray-700">
                Morador: {item.morador}
              </div>

            </div>

            <select
              defaultValue={item.status}
              className="
                border
                rounded-2xl
                p-3
                text-gray-900
                bg-white
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
              bg-gray-100
              rounded-2xl
              p-5
              mt-6
            "
          >

            <div className="text-gray-700 text-sm">
              Resposta da Administração
            </div>

            <div className="text-gray-900 mt-3 text-lg">
              {item.resposta}
            </div>

          </div>

          <button
            className="
              mt-6
              border
              border-gray-300
              px-6
              py-3
              rounded-2xl
              hover:bg-gray-100
              text-gray-900
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