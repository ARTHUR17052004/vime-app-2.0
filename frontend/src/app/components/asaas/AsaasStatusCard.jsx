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
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-[24px] rounded-2xl border border-white/[0.07] overflow-hidden">

      <div className="px-8 py-6 border-b border-white/[0.07]">
        <h2 className="text-2xl font-bold text-white">
          Status da Integração
        </h2>

        <p className="text-gray-400 mt-1">
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

              <span className="font-medium text-gray-200">
                {item.titulo}
              </span>

            </div>

            <span className="font-semibold text-white">
              {item.valor}
            </span>

          </div>

        ))}

      </div>

      <div className="px-8 py-4 border-t border-white/[0.07] flex justify-between">

        <span className="text-gray-400">
          Última verificação
        </span>

        <span className="font-semibold text-green-400">
          Agora mesmo
        </span>

      </div>

    </div>
  );
}