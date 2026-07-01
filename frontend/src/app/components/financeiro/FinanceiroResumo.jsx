"use client";

export default function FinanceiroResumo({
  receitaPrevista,
  totalDespesas,
  lucroLiquido,
}) {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">

      <div
        className="
          bg-white
          rounded-3xl
          shadow
          p-6
        "
      >
        <p className="text-gray-500">
          Receita Prevista
        </p>

        <h2
          className="
            text-4xl
            font-bold
            text-green-700
            mt-3
          "
        >
          R$ {receitaPrevista}
        </h2>
      </div>

      <div
        className="
          bg-white
          rounded-3xl
          shadow
          p-6
        "
      >
        <p className="text-gray-500">
          Total Despesas
        </p>

        <h2
          className="
            text-4xl
            font-bold
            text-red-600
            mt-3
          "
        >
          R$ {totalDespesas}
        </h2>
      </div>

      <div
        className="
          bg-white
          rounded-3xl
          shadow
          p-6
        "
      >
        <p className="text-gray-500">
          Lucro Líquido
        </p>

        <h2
          className="
            text-4xl
            font-bold
            text-blue-700
            mt-3
          "
        >
          R$ {lucroLiquido}
        </h2>
      </div>

    </div>
  );
}