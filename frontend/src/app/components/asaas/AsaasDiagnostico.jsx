export default function AsaasDiagnostico() {
  const diagnosticos = [
    {
      nome: "API Key",
      status: "Válida",
      cor: "bg-green-500",
    },
    {
      nome: "Conexão Asaas",
      status: "Online",
      cor: "bg-green-500",
    },
    {
      nome: "Wallet",
      status: "Encontrada",
      cor: "bg-green-500",
    },
    {
      nome: "Split",
      status: "Pendente",
      cor: "bg-yellow-400",
    },
    {
      nome: "Webhook",
      status: "Configurado",
      cor: "bg-green-500",
    },
    {
      nome: "Ambiente",
      status: "Sandbox",
      cor: "bg-blue-500",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-[24px] rounded-2xl border border-white/[0.07]">

      <div className="px-8 py-6 border-b border-white/[0.07]">

        <h2 className="text-2xl font-bold text-white">
          Diagnóstico da Integração
        </h2>

        <p className="text-gray-400 mt-2">
          Verifique rapidamente a saúde da integração com o Asaas.
        </p>

      </div>

      <div className="p-8 space-y-5">

        {diagnosticos.map((item) => (

          <div
            key={item.nome}
            className="
              flex
              justify-between
              items-center
              border
              border-white/[0.07]
              rounded-xl
              p-4
              hover:bg-white/5
              transition
            "
          >

            <div className="flex items-center gap-4">

              <div
                className={`w-3 h-3 rounded-full ${item.cor}`}
              />

              <span className="font-semibold text-gray-200">
                {item.nome}
              </span>

            </div>

            <span className="font-semibold text-white">
              {item.status}
            </span>

          </div>

        ))}

      </div>

      <div className="border-t border-white/[0.07] px-8 py-5 flex justify-between">

        <span className="text-gray-400">
          Última sincronização
        </span>

        <span className="font-bold text-green-400">
          Hoje • 14:35
        </span>

      </div>

    </div>
  );
}