"use client";

export default function DashboardHeader() {
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
    <div className="flex justify-between items-center mb-8">

      <div>

        <h1 className="text-4xl font-bold text-gray-800">
          {saudacao}, Arthur 👋
        </h1>

        <p className="text-gray-500 mt-2 capitalize">
          {hoje}
        </p>

      </div>

      <div className="text-right">

        <p className="text-sm text-gray-500">
          Dashboard
        </p>

        <h2 className="text-3xl font-bold text-green-700">
          VIME 2.0
        </h2>

      </div>

    </div>
  );
}