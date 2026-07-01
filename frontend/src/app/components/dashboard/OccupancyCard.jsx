"use client";

import Card from "../ui/Card";

export default function OccupancyCard({ ocupacao }) {

  return (
    <Card>

      <h2 className="text-xl font-bold mb-6">
        Ocupação
      </h2>

      <div className="space-y-5">

        <div>

          <p className="text-gray-500">
            Kitnets Ocupadas
          </p>

          <h2 className="text-3xl font-bold text-green-700">
            {ocupacao?.ocupadas ?? 0}
          </h2>

        </div>

        <div>

          <p className="text-gray-500">
            Kitnets Vagas
          </p>

          <h2 className="text-3xl font-bold text-orange-600">
            {ocupacao?.vazias ?? 0}
          </h2>

        </div>

        <div>

          <p className="text-gray-500">
            Ocupação
          </p>

          <h2 className="text-2xl font-bold text-blue-700">
            {ocupacao?.percentual ?? 0}%
          </h2>

        </div>

      </div>

    </Card>
  );
}