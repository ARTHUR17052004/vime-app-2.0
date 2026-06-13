export default function QuickActions() {
  const actions = [
    "Nova Unidade",
    "Novo Inquilino",
    "Novo Contrato",
    "Nova Solicitação",
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">
        Ações Rápidas
      </h2>

      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <button
            key={action}
            className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}