"use client";

export default function DashboardHeader({
  usuario = "Arthur",
  modulo = "Dashboard",
  sistema = "VIME 2.0",
  ultimaAtualizacao,
}) {
  const hora = new Date().getHours();

  let saudacao = "Boa noite";

  if (hora < 12) {
    saudacao = "Bom dia";
  } else if (hora < 18) {
    saudacao = "Boa tarde";
  }

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

      <div>

        <h1 className="text-4xl font-bold text-gray-800">
          {saudacao}, {usuario} 👋
        </h1>

        <p className="text-gray-500 mt-2 capitalize">
          {hoje}
        </p>

        {ultimaAtualizacao && (
          <p className="text-xs text-gray-400 mt-1">
            Atualizado em {ultimaAtualizacao}
          </p>
        )}

      </div>

      <div className="text-left lg:text-right">

        <p className="text-sm uppercase tracking-widest text-gray-500">
          {modulo}
        </p>

        <h2 className="text-3xl font-bold text-green-700">
          {sistema}
        </h2>

      </div>

    </div>
  );
}