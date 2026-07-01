"use client";

import Card from "../ui/Card";

export default function RecentActivities({
  atividades = [],
}) {
  return (
    <Card>

      <h2 className="text-xl font-bold mb-5">
        Atividades Recentes
      </h2>

      <div className="space-y-3">

        {atividades.length === 0 ? (

          <p className="text-gray-500">
            Nenhuma atividade encontrada.
          </p>

        ) : (

          atividades.map((item) => (

            <div
              key={item.id}
              className="border rounded-xl p-3 hover:bg-gray-50"
            >
              <p className="font-medium">
                {item.descricao}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {item.data}
              </p>
            </div>

          ))

        )}

      </div>

    </Card>
  );
}