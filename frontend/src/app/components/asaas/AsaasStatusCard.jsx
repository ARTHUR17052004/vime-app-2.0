export default function AsaasStatusCard() {
  const status = [
    {
      titulo: "API Asaas",
      valor: "Conectada",
      cor: "bg-green-500",
    },
    {
      titulo: "Wallet",
      valor: "Encontrada",
      cor: "bg-green-500",
    },
    {
      titulo: "Split",
      valor: "Aguardando",
      cor: "bg-yellow-400",
    },
    {
      titulo: "Webhook",
      valor: "Configurado",
      cor: "bg-green-500",
    },
    {
      titulo: "Ambiente",
      valor: "Sandbox",
      cor: "bg-blue-500",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

      <div className="px-8 py-6 border-b bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800">
          Status da Integração
        </h2>

        <p className="text-gray-500 mt-1">
          Acompanhe rapidamente a situação da conexão com o Asaas.
        </p>
      </div>

      <div className="p-8 space-y-5">

        {status.map((item) => (

          <div
            key={item.titulo}
            className="flex justify-between items-center"
          >

            <div className="flex items-center gap-4">

              <div
                className={`w-3 h-3 rounded-full ${item.cor}`}
              />

              <span className="font-medium text-gray-700">
                {item.titulo}
              </span>

            </div>

            <span className="font-semibold text-gray-800">
              {item.valor}
            </span>

          </div>

        ))}

      </div>

      <div className="px-8 py-4 bg-gray-50 border-t flex justify-between">

        <span className="text-gray-500">
          Última verificação
        </span>

        <span className="font-semibold text-green-600">
          Agora mesmo
        </span>

      </div>

    </div>
  );
}