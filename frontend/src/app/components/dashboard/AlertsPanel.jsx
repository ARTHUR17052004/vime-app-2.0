export default function AlertsPanel() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">
        Alertas
      </h2>

      <div className="space-y-4">
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg">
          Nenhum contrato vencendo.
        </div>

        <div className="bg-red-100 text-red-800 p-3 rounded-lg">
          Nenhum aluguel atrasado.
        </div>

        <div className="bg-blue-100 text-blue-800 p-3 rounded-lg">
          Nenhuma solicitação pendente.
        </div>
      </div>
    </div>
  );
}