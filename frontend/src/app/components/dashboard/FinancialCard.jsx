"use client";

import Card from "../ui/Card";
import { formatCurrency } from "@/utils/formatCurrency";

export default function FinancialCard({ financeiro }) {
  const recebido = financeiro?.recebido ?? 0;
  const pendente = financeiro?.pendente ?? 0;
  const atrasado = financeiro?.atrasado ?? 0;

  return (
    <Card>
      <h2 className="text-xl font-bold mb-6">
        Financeiro
      </h2>

      <div className="space-y-5">

        <div>
          <p className="text-gray-500">
            Recebido
          </p>

          <h2 className="text-3xl font-bold text-green-700">
            {formatCurrency(recebido)}
          </h2>
        </div>

        <div>
          <p className="text-gray-500">
            Pendente
          </p>

          <h2 className="text-3xl font-bold text-yellow-600">
            {formatCurrency(pendente)}
          </h2>
        </div>

        <div>
          <p className="text-gray-500">
            Atrasado
          </p>

          <h2 className="text-3xl font-bold text-red-600">
            {formatCurrency(atrasado)}
          </h2>
        </div>

      </div>
    </Card>
  );
}