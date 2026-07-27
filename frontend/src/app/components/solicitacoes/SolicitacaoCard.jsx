"use client";

import Link from "next/link";

import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function SolicitacaoCard({
  solicitacoes,
  onEdit,
  onDelete,
  onAlterarStatus,
  onResponder,
}) {

  if (solicitacoes.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-gray-400">
          Nenhuma solicitação encontrada.
        </p>
      </Card>
    );
  }

  return (

    <div className="space-y-6">

      {solicitacoes.map((item) => (

        <Card
          key={item.id}
          className="p-8"
        >

          <div className="flex justify-between items-start gap-6">

            <div className="flex-1">

              <p className="text-sm text-gray-400">
                {item.numero}
              </p>

              <h2 className="text-2xl font-bold text-white mt-2">
                {item.titulo}
              </h2>

            </div>

            <Badge
              variant={
                item.status === "ATENDIDA"
                  ? "emerald"
                  : item.status === "REJEITADA"
                  ? "red"
                  : item.status === "EM COTAÇÃO"
                  ? "yellow"
                  : item.status === "AGUARDANDO COMPRA"
                  ? "blue"
                  : "gray"
              }
            >
              {item.status}
            </Badge>

          </div>

          <div className="mt-6">

            <p className="text-sm text-gray-400 mb-2">
              Descrição
            </p>

            <div
              className="
                bg-white/5
                border
                border-white/10
                rounded-2xl
                p-5
                text-gray-300
                leading-relaxed
              "
            >
              {item.descricao || "Sem descrição."}
            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">

            <div>

              <p className="text-sm text-gray-400">
                Responsável
              </p>

              <p className="font-semibold text-white mt-1">
                {item.responsavel || "-"}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-400">
                Data
              </p>

              <p className="font-semibold text-white mt-1">
                {item.data || "-"}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-400">
                Prazo
              </p>

              <p className="font-semibold text-white mt-1">
                {item.prazo || "-"}
              </p>

            </div>

          </div>

          {item.observacoes && (

            <div className="mt-6">

              <p className="text-sm text-gray-400 mb-2">
                Observações
              </p>

              <div
                className="
                  bg-white/5
                  border
                  border-white/10
                  rounded-2xl
                  p-5
                  text-gray-300
                "
              >
                {item.observacoes}
              </div>

            </div>

          )}
            {item.resposta && (

  <div className="mt-6">

    <p className="text-sm text-gray-400 mb-2">
      Resposta
    </p>

    <div
      className="
        bg-emerald-500/10
        border
        border-emerald-500/20
        rounded-2xl
        p-5
        text-gray-300
      "
    >
      {item.resposta}
    </div>

  </div>

)}

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
      rounded-xl
      border
      border-white/10
      bg-white/5
      px-4
      py-3
      text-white
      outline-none
      focus:border-emerald-500
    "
  >

    <option value="SOLICITADA">SOLICITADA</option>

    <option value="EM COTAÇÃO">EM COTAÇÃO</option>

    <option value="AGUARDANDO COMPRA">
      AGUARDANDO COMPRA
    </option>

    <option value="ATENDIDA">ATENDIDA</option>

    <option value="REJEITADA">REJEITADA</option>

  </select>

  <div className="flex flex-wrap gap-3">

    <Link href={`/solicitacoes/${item.id}`}>

      <Button variant="secondary">
        Visualizar
      </Button>

    </Link>

    <Button
      variant="blue"
      onClick={() => onResponder(item)}
    >
      Responder
    </Button>

    <Button
      variant="yellow"
      onClick={() => onEdit(item)}
    >
      Editar
    </Button>

    <Button
      variant="red"
      onClick={() => onDelete(item.id)}
    >
      Excluir
    </Button>

  </div>

</div>

</Card>

      ))}

    </div>

  );

}