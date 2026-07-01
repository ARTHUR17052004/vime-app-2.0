"use client";

import { useRouter } from "next/navigation";

export default function KitnetCard({
  kitnet,
}) {
  const router = useRouter();

  return (
    <div
      onClick={() =>
        router.push(`/kitnets/${kitnet.id}`)
      }
      className="
        bg-white
        rounded-2xl
        shadow-md
        border
        p-6
        cursor-pointer
        transition-all
        hover:shadow-xl
        hover:-translate-y-1
      "
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-gray-900">
          {kitnet.nome}
        </h3>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            kitnet.status === "Disponível"
              ? "bg-green-100 text-green-700"
              : kitnet.status === "Ocupada"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {kitnet.status}
        </span>
      </div>

      <div className="space-y-2 text-gray-800">

        <p>
          🏠 <strong>Unidade:</strong>{" "}
          {kitnet.unidadeNome}
        </p>

        <p>
          📏 <strong>Metragem:</strong>{" "}
          {kitnet.metragem} m²
        </p>

        <p>
          💰 <strong>Aluguel:</strong>{" "}
          R$ {kitnet.aluguel}
        </p>

        <p>
          🚪 <strong>Número:</strong>{" "}
          {kitnet.numero}
        </p>

      </div>
    </div>
  );
}