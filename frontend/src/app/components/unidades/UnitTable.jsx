"use client";

export default function UnitTable({
  unidades,
  onEdit,
  onDelete,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Inativa":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
            Inativa
          </span>
        );

      case "Manutenção":
        return (
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
            Manutenção
          </span>
        );

      default:
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            Ativa
          </span>
        );
    }
  };

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
            <th className="text-left p-4">🏢 Nome</th>
            <th className="text-left p-4">📍 Cidade</th>
            <th className="text-left p-4">UF</th>
            <th className="text-left p-4">🏠 Kitnets</th>
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
              <td className="p-4 font-medium">
                {unidade.nome}
              </td>

              <td className="p-4">
                {unidade.cidade}
              </td>

              <td className="p-4 uppercase">
                {unidade.uf}
              </td>

              <td className="p-4">
                {unidade.kitnets}
              </td>

              <td className="p-4">
                {getStatusBadge(unidade.status)}
              </td>

              <td className="p-4">
                <div className="flex gap-4">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}