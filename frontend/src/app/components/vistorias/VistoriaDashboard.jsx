"use client";

export default function VistoriaDashboard({
  vistorias,
}) {

  const agendadas =
    vistorias.filter(
      (vistoria) =>
        vistoria.status ===
        "AGENDADA"
    ).length;

  const realizadas =
    vistorias.filter(
      (vistoria) =>
        vistoria.status ===
        "REALIZADA"
    ).length;

  const pendentes =
    vistorias.filter(
      (vistoria) =>
        vistoria.status ===
        "PENDENTE"
    ).length;

  return (

    <div className="bg-white rounded-3xl shadow p-10">

      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Dashboard das Vistorias
      </h2>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-blue-50 rounded-3xl p-6">

          <h3 className="text-gray-800 text-lg">
            Agendadas
          </h3>

          <div className="text-4xl font-bold text-blue-700 mt-3">
            {agendadas}
          </div>

        </div>

        <div className="bg-green-50 rounded-3xl p-6">

          <h3 className="text-gray-800 text-lg">
            Realizadas
          </h3>

          <div className="text-4xl font-bold text-green-700 mt-3">
            {realizadas}
          </div>

        </div>

        <div className="bg-yellow-50 rounded-3xl p-6">

          <h3 className="text-gray-800 text-lg">
            Pendentes
          </h3>

          <div className="text-4xl font-bold text-yellow-700 mt-3">
            {pendentes}
          </div>

        </div>

      </div>

    </div>

  );

}