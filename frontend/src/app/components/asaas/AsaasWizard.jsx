export default function AsaasWizard() {
  const etapas = [
    {
      numero: 1,
      titulo: "API",
      descricao: "Informar a API Key",
      ativo: true,
    },
    {
      numero: 2,
      titulo: "Conexão",
      descricao: "Testar comunicação",
      ativo: false,
    },
    {
      numero: 3,
      titulo: "Wallet",
      descricao: "Buscar Wallet ID",
      ativo: false,
    },
    {
      numero: 4,
      titulo: "Webhook",
      descricao: "Configurar eventos",
      ativo: false,
    },
    {
      numero: 5,
      titulo: "Finalizar",
      descricao: "Salvar configuração",
      ativo: false,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">

      <h2 className="text-2xl font-bold text-gray-800">
        Assistente de Configuração
      </h2>

      <p className="text-gray-500 mt-2 mb-8">
        Siga as etapas abaixo para concluir a integração com o Asaas.
      </p>

      <div className="flex items-center justify-between flex-wrap gap-6">

        {etapas.map((etapa, index) => (

          <div
            key={etapa.numero}
            className="flex items-center flex-1 min-w-[170px]"
          >

            <div className="flex flex-col items-center">

              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white
                ${etapa.ativo ? "bg-green-600" : "bg-gray-300"}`}
              >
                {etapa.numero}
              </div>

              <span className="mt-3 font-semibold text-gray-800">
                {etapa.titulo}
              </span>

              <span className="text-xs text-gray-500 text-center mt-1">
                {etapa.descricao}
              </span>

            </div>

            {index < etapas.length - 1 && (
              <div className="flex-1 h-1 bg-gray-200 mx-4 rounded" />
            )}

          </div>

        ))}

      </div>

    </div>
  );
}