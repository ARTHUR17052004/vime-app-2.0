export default function AsaasTutorial() {
  const passos = [
    {
      numero: "01",
      titulo: "Criar conta no Asaas",
      descricao:
        "Caso ainda não possua uma conta, cadastre-se na plataforma Asaas.",
    },
    {
      numero: "02",
      titulo: "Gerar a API Key",
      descricao:
        "No painel do Asaas, acesse Integrações e copie sua chave de API.",
    },
    {
      numero: "03",
      titulo: "Escolher o ambiente",
      descricao:
        "Selecione Sandbox para testes ou Produção para utilização real.",
    },
    {
      numero: "04",
      titulo: "Inserir os dados no VIME",
      descricao:
        "Informe API Key, Wallet ID, Token do Webhook e Taxa Administrativa.",
    },
    {
      numero: "05",
      titulo: "Testar conexão",
      descricao:
        "Clique em 'Testar Conexão' para validar a comunicação com o Asaas.",
    },
    {
      numero: "06",
      titulo: "Buscar Wallet",
      descricao:
        "Caso necessário, utilize o botão para localizar automaticamente sua Wallet.",
    },
    {
      numero: "07",
      titulo: "Salvar configuração",
      descricao:
        "Finalize o processo salvando a integração.",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-[24px] rounded-2xl border border-white/[0.07]">

      <div className="px-8 py-6 border-b border-white/[0.07]">

        <h2 className="text-2xl font-bold text-white">
          Guia de Configuração
        </h2>

        <p className="text-gray-400 mt-2">
          Siga as etapas abaixo para concluir corretamente a integração com o Asaas.
        </p>

      </div>

      <div className="p-8 space-y-5">

        {passos.map((passo) => (

          <div
            key={passo.numero}
            className="
              flex
              gap-5
              border
              border-white/[0.07]
              rounded-2xl
              p-5
              hover:bg-white/5
              transition
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-full
                bg-green-700
                text-white
                flex
                items-center
                justify-center
                font-bold
                text-lg
                shrink-0
              "
            >
              {passo.numero}
            </div>

            <div>

              <h3 className="font-bold text-lg text-white">
                {passo.titulo}
              </h3>

              <p className="text-gray-400 mt-1">
                {passo.descricao}
              </p>

            </div>

          </div>

        ))}

      </div>

      <div className="border-t border-white/[0.07] bg-green-500/10 px-8 py-5">

        <p className="text-green-400 font-semibold">
          ✔ Após concluir todas as etapas, sua integração estará pronta para utilização no VIME.
        </p>

      </div>

    </div>
  );
}