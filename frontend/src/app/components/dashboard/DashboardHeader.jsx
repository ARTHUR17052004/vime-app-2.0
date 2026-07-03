"use client";

export default function DashboardHeader({
  usuario = "Arthur",
  modulo = "Dashboard",
  sistema = "2.0",
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
    <section
      className="
        pt-6
        mb-10
      "
    >
      <div className="flex items-end justify-between">

        {/* ESQUERDA */}

        <div className="pt-2">

          <h1
            className="
              text-4xl
              xl:text-[52px]
              font-extrabold
              tracking-tight
              text-white
              leading-none
            "
          >
            {saudacao}, {usuario}
            <span className="ml-3">👋</span>
          </h1>

          <p
            className="
              mt-3
              text-base
              text-gray-300
              capitalize
              font-medium
            "
          >
            {hoje}
          </p>

          {ultimaAtualizacao && (
            <p className="mt-2 text-sm text-gray-400">
              Atualizado em {ultimaAtualizacao}
            </p>
          )}

        </div>

        {/* DIREITA */}

        <div className="text-right select-none pt-4">

          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.45em]
              text-emerald-400
              font-semibold
            "
          >
            {modulo}
          </p>

          <h2
            className="
              mt-1
              text-5xl
              font-black
              text-emerald-500
              leading-none
            "
          >
            {sistema}
          </h2>

        </div>

      </div>
    </section>
  );
}