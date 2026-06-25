"use client";

export default function VistoriaRelatorios({
  vistorias = [],
}) {

  const total =
    vistorias.length;

  const programadas =
    vistorias.filter(
      (item) =>
        item.status ===
        "PROGRAMADA"
    ).length;

  const realizadas =
    vistorias.filter(
      (item) =>
        item.status ===
        "REALIZADA"
    ).length;

  const atrasadas =
    vistorias.filter(
      (item) =>
        item.status ===
        "ATRASADA"
    ).length;

  return (

    <div className="bg-white rounded-3xl shadow p-8">

      <h2 className="text-2xl font-bold text-gray-900 mb-6">

        Relatórios

      </h2>

      <div className="grid md:grid-cols-4 gap-4">

        <div className="border rounded-2xl p-5">

          <div className="text-gray-700">
            Total
          </div>

          <div className="text-3xl font-bold text-gray-900 mt-2">
            {total}
          </div>

        </div>

        <div className="border rounded-2xl p-5">

          <div className="text-gray-700">
            Programadas
          </div>

          <div className="text-3xl font-bold text-blue-700 mt-2">
            {programadas}
          </div>

        </div>

        <div className="border rounded-2xl p-5">

          <div className="text-gray-700">
            Realizadas
          </div>

          <div className="text-3xl font-bold text-green-700 mt-2">
            {realizadas}
          </div>

        </div>

        <div className="border rounded-2xl p-5">

          <div className="text-gray-700">
            Atrasadas
          </div>

          <div className="text-3xl font-bold text-red-700 mt-2">
            {atrasadas}
          </div>

        </div>

      </div>

    </div>

  );

}