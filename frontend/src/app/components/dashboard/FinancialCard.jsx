"use client";

import Card from "../ui/Card";
import { formatCurrency } from "@/utils/formatCurrency";

export default function FinancialCard() {

  return (
    <Card>

      <h2 className="text-xl font-bold mb-6">
        Financeiro
      </h2>

      <div className="space-y-5">

        <div>

          <p className="text-gray-500">
            Receita
          </p>

          <h2 className="text-3xl font-bold text-green-700">
            {formatCurrency(18450)}
          </h2>

        </div>

        <div>

          <p className="text-gray-500">
            Despesas
          </p>

          <h2 className="text-3xl font-bold text-red-600">
            {formatCurrency(2800)}
          </h2>

        </div>

        <div>

          <p className="text-gray-500">
            Saldo
          </p>

          <h2 className="text-3xl font-bold text-blue-600">
            {formatCurrency(15650)}
          </h2>

        </div>

      </div>

    </Card>
  );
}