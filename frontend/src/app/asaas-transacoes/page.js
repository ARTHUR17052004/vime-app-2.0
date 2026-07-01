import MainLayout from "../components/layout/MainLayout";

import AsaasResumoCards from "../components/asaas-transacoes/AsaasResumoCards";
import AsaasFiltros from "../components/asaas-transacoes/AsaasFiltros";
import AsaasTabela from "../components/asaas-transacoes/AsaasTabela";
import AsaasExportar from "../components/asaas-transacoes/AsaasExportar";
import AsaasDetalhesModal from "../components/asaas-transacoes/AsaasDetalhesModal";

export default function AsaasTransacoesPage() {
  return (
    <MainLayout>
      <div className="space-y-8">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold text-gray-800">
              Asaas Transações
            </h1>

            <p className="text-gray-500 mt-2">
              Gerencie cobranças, recebimentos e sincronizações com o Asaas.
            </p>

          </div>

          <div className="flex gap-4">

            <button
              className="
              px-5
              py-3
              rounded-xl
              border
              border-gray-300
              hover:bg-gray-100
              "
            >
              Atualizar
            </button>

            <button
              className="
              px-5
              py-3
              rounded-xl
              bg-green-700
              hover:bg-green-800
              text-white
              "
            >
              Nova Cobrança
            </button>

          </div>

        </div>

        <AsaasResumoCards />
        <AsaasFiltros />
        <AsaasTabela />
        <AsaasExportar />
        <AsaasDetalhesModal />

      </div>
    </MainLayout>
  );
}