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

    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

      <h2 className="text-2xl font-bold text-white mb-6">

        Relatórios

      </h2>

      <div className="grid md:grid-cols-4 gap-4">

        <div className="border border-white/10 rounded-2xl p-5">

          <div className="text-gray-400">
            Total
          </div>

          <div className="text-3xl font-bold text-white mt-2">
            {total}
          </div>

        </div>

        <div className="border border-white/10 rounded-2xl p-5">

          <div className="text-gray-400">
            Programadas
          </div>

          <div className="text-3xl font-bold text-blue-400 mt-2">
            {programadas}
          </div>

        </div>

        <div className="border border-white/10 rounded-2xl p-5">

          <div className="text-gray-400">
            Realizadas
          </div>

          <div className="text-3xl font-bold text-emerald-400 mt-2">
            {realizadas}
          </div>

        </div>

        <div className="border border-white/10 rounded-2xl p-5">

          <div className="text-gray-400">
            Atrasadas
          </div>

          <div className="text-3xl font-bold text-red-400 mt-2">
            {atrasadas}
          </div>

        </div>

      </div>

    </div>

  );

}