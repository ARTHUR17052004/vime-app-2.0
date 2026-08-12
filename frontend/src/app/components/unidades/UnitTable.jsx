"use client";

export default function UnitTable({
  unidades,
  onEdit,
  onDelete,
  onView,
}) {
  if (unidades.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-xl p-10 text-center text-gray-400">
        Nenhuma unidade cadastrada.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {unidades.map((unidade) => (
        <div
          key={unidade.id}
          className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6 transition hover:border-emerald-400/20"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {unidade.nome}
              </h2>

              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                  unidade.status === "Ativa"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : unidade.status === "Manutenção"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {unidade.status}
              </span>
            </div>

            <button className="text-gray-400 text-xl hover:text-white">
              ⋮
            </button>
          </div>

          <div className="space-y-3 text-gray-400">
            <p>
              📍 {unidade.endereco || "-"}
              {unidade.numero
                ? `, ${unidade.numero}`
                : ""}
            </p>

            <p>
              🏙 {unidade.cidade || "-"} -{" "}
              {unidade.uf || "-"}
            </p>

            <p>
              💰 R$ {unidade.aluguel || "0,00"}
            </p>
          </div>

          <div className="border-t border-white/10 my-4"></div>

          <div className="space-y-2 text-gray-300">
            <p>
              🏠 Kitnets: {unidade.kitnets || 0}
            </p>

            <p>
              📅 Vencimento: Dia{" "}
              {unidade.vencimento || "-"}
            </p>

            <p>
              👤 Locador:{" "}
              {unidade.locador || "-"}
            </p>
          </div>

          <div className="flex gap-4 mt-6 text-sm">
            <button
              onClick={() => onView(unidade)}
              className="text-purple-600 hover:underline"
            >
              Visualizar
            </button>

            <button
              onClick={() => onEdit(unidade)}
              className="text-blue-600 hover:underline"
            >
              Editar
            </button>

            <button
              onClick={() => onDelete(unidade.id)}
              className="text-red-600 hover:underline"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}