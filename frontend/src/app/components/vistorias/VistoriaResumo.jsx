"use client";

export default function VistoriaResumo({
  vistorias,
}) {

  const programadas =
    vistorias.filter(
      (vistoria) =>
        vistoria.status ===
        "PROGRAMADA"
    ).length;

  const realizadas =
    vistorias.filter(
      (vistoria) =>
        vistoria.status ===
        "REALIZADA"
    ).length;

  const atrasadas =
    vistorias.filter(
      (vistoria) =>
        vistoria.status ===
        "ATRASADA"
    ).length;

  const total =
    vistorias.length;

  return (

    <div className="grid md:grid-cols-4 gap-6 mb-8">

      <div className="bg-white rounded-3xl shadow p-8">

        <p className="text-gray-800">
          Total
        </p>

        <h2 className="text-4xl font-bold text-gray-900 mt-3">
          {total}
        </h2>

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <p className="text-gray-800">
          Programadas
        </p>

        <h2 className="text-4xl font-bold text-blue-700 mt-3">
          {programadas}
        </h2>

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <p className="text-gray-800">
          Realizadas
        </p>

        <h2 className="text-4xl font-bold text-green-700 mt-3">
          {realizadas}
        </h2>

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <p className="text-gray-800">
          Atrasadas
        </p>

        <h2 className="text-4xl font-bold text-red-700 mt-3">
          {atrasadas}
        </h2>

      </div>

    </div>

  );

}