"use client";

export default function UnitTable({
  unidades,
  onEdit,
}) {
  if (unidades.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">Cidade</th>
              <th className="text-left p-4">UF</th>
              <th className="text-left p-4">Kitnets</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td
                colSpan="6"
                className="text-center p-10 text-gray-500"
              >
                Nenhuma unidade cadastrada.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-4">Nome</th>
            <th className="text-left p-4">Cidade</th>
            <th className="text-left p-4">UF</th>
            <th className="text-left p-4">Kitnets</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Ações</th>
          </tr>
        </thead>

        <tbody>
          {unidades.map((unidade) => (
            <tr
              key={unidade.id}
              className="border-b hover:bg-gray-50"
            >
              <td className="p-4">{unidade.nome}</td>
              <td className="p-4">{unidade.cidade}</td>
              <td className="p-4">{unidade.uf}</td>
              <td className="p-4">{unidade.kitnets}</td>

              <td className="p-4">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Ativa
                </span>
              </td>

              <td className="p-4 flex gap-4">
                <button
                  onClick={() => onEdit(unidade)}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </button>

                <button
                  className="text-red-600 hover:underline"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 