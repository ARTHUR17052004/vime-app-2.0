export default function FinancialCard() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Financeiro
      </h2>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-sm text-gray-500">
            Receita Mensal
          </p>

          <p className="text-2xl font-bold text-green-600">
            R$ 0,00
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Despesas
          </p>

          <p className="text-2xl font-bold text-red-600">
            R$ 0,00
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Saldo
          </p>

          <p className="text-2xl font-bold text-blue-600">
            R$ 0,00
          </p>
        </div>
      </div>
    </div>
  );
}