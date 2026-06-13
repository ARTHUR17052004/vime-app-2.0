export default function SystemStatus() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">
        Status do Sistema
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span>WhatsApp</span>
          <span className="text-green-600 font-bold">
            Online
          </span>
        </div>

        <div className="flex justify-between">
          <span>Clicksign</span>
          <span className="text-green-600 font-bold">
            Conectado
          </span>
        </div>

        <div className="flex justify-between">
          <span>Asaas</span>
          <span className="text-green-600 font-bold">
            Conectado
          </span>
        </div>

        <div className="flex justify-between">
          <span>Banco</span>
          <span className="text-green-600 font-bold">
            Operacional
          </span>
        </div>
      </div>
    </div>
  );
}