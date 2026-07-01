"use client";

import Link from "next/link";

export default function SolicitacaoCard({
  solicitacoes,
  onEdit,
  onDelete,
  onAlterarStatus,
  onResponder,
}) {

  if (solicitacoes.length === 0) {

    return (

      <div
        className="
          bg-white
          rounded-3xl
          shadow
          border
          p-10
          text-center
          text-gray-500
        "
      >

        Nenhuma solicitação encontrada.

      </div>

    );

  }

  const corStatus = (status) => {

    switch (status) {

      case "SOLICITADA":
        return "bg-blue-100 text-blue-700";

      case "EM COTAÇÃO":
        return "bg-yellow-100 text-yellow-700";

      case "AGUARDANDO COMPRA":
        return "bg-orange-100 text-orange-700";

      case "ATENDIDA":
        return "bg-green-100 text-green-700";

      case "REJEITADA":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";

    }

  };

  return (

    <div className="space-y-6">

      {solicitacoes.map((item) => (

        <div
          key={item.id}
          className="
            bg-white
            rounded-3xl
            shadow
            border
            p-8
            hover:shadow-lg
            transition
          "
        >

          <div className="flex justify-between items-start gap-6">

            <div className="flex-1">

              <p className="text-sm text-gray-500">

                {item.numero}

              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-2">

                {item.titulo}

              </h2>

            </div>

            <span
              className={`
                px-4
                py-2
                rounded-full
                text-xs
                font-semibold
                whitespace-nowrap
                ${corStatus(item.status)}
              `}
            >

              {item.status}

            </span>

          </div>

          <div className="mt-6">

            <p className="text-sm text-gray-500 mb-2">

              Descrição

            </p>

            <div
              className="
                bg-gray-50
                border
                rounded-2xl
                p-5
                text-gray-700
                leading-relaxed
              "
            >

              {item.descricao || "Sem descrição."}

            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">

            <div>

              <p className="text-sm text-gray-500">
                Responsável
              </p>

              <p className="font-semibold text-gray-900 mt-1">

                {item.responsavel || "-"}

              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Data
              </p>

              <p className="font-semibold text-gray-900 mt-1">

                {item.data || "-"}

              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Prazo
              </p>

              <p className="font-semibold text-gray-900 mt-1">

                {item.prazo || "-"}

              </p>

            </div>

          </div>

          {

            item.observacoes && (

              <div className="mt-6">

                <p className="text-sm text-gray-500 mb-2">

                  Observações

                </p>

                <div
                  className="
                    bg-gray-50
                    border
                    rounded-2xl
                    p-5
                    text-gray-700
                  "
                >

                  {item.observacoes}

                </div>

              </div>

            )

          }

          {
            item.resposta && (

              <div className="mt-6">

                <p className="text-sm text-gray-500 mb-2">

                  Resposta

                </p>

                <div
                  className="
                    bg-green-50
                    border
                    border-green-200
                    rounded-2xl
                    p-5
                    text-gray-700
                  "
                >

                  {item.resposta}

                </div>

              </div>

            )
          }
          <div
            className="
              flex
              items-center
              justify-between
              flex-wrap
              gap-4
              mt-8
            "
          >

            <select
              value={item.status}
              onChange={(e) =>
                onAlterarStatus(
                  item.id,
                  e.target.value
                )
              }
              className="
                border
                rounded-xl
                px-4
                py-2
                bg-white
                text-gray-900
              "
            >

              <option>SOLICITADA</option>

              <option>EM COTAÇÃO</option>

              <option>AGUARDANDO COMPRA</option>

              <option>ATENDIDA</option>

              <option>REJEITADA</option>

            </select>

            <div className="flex flex-wrap gap-3">

                         <Link
                href={`/solicitacoes/${item.id}`}
                className="
                  px-5
                  py-2
                  rounded-xl
                  border
                  hover:bg-gray-100
                  transition
                "
              >
                Visualizar
              </Link>
              
              <button
                onClick={() =>
                  onResponder(item)
                }
                className="
                  px-5
                  py-2
                  rounded-xl
                  bg-blue-600
                  text-white
                  hover:bg-blue-700
                  transition
                "
              >

                Responder

              </button>

              <button
                onClick={() => onEdit(item)}
                className="
                  px-5
                  py-2
                  rounded-xl
                  bg-yellow-500
                  text-white
                  hover:bg-yellow-600
                  transition
                "
              >
                Editar
              </button>

              <button
                onClick={() => onDelete(item.id)}
                className="
                  px-5
                  py-2
                  rounded-xl
                  bg-red-600
                  text-white
                  hover:bg-red-700
                  transition
                "
              >
                Excluir
              </button>

            </div>

          </div>

        </div>

      ))}

    </div>

  );

}