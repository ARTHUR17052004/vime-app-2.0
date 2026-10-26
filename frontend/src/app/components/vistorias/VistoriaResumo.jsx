"use client";

// Mesmo dia local (não UTC) -- comparar por componente de data evita o
// mesmo bug de fuso já corrigido em outros lugares do sistema.
function ehHoje(data) {
  if (!data) return false;
  const d = new Date(data);
  const hoje = new Date();
  return (
    d.getFullYear() === hoje.getFullYear() &&
    d.getMonth() === hoje.getMonth() &&
    d.getDate() === hoje.getDate()
  );
}

export default function VistoriaResumo({
  vistorias,
  missoesRealizadas = [],
  abaSelecionada,
  setAbaSelecionada,
}) {

  const programadas =
    vistorias.filter(
      (vistoria) =>
        vistoria.status ===
        "PROGRAMADA"
    ).length;

  // "Realizadas" = atividade de hoje, não histórico total -- senão o
  // card só cresceria pra sempre e pararia de refletir o estado atual
  // (diferente dos outros 3 cards, que são uma foto de agora). Soma
  // vistorias "normais" concluídas hoje com missões (vistorias
  // "Geral", por residência) concluídas hoje -- essas últimas nunca
  // deixam a vistoria-mãe com status "Realizada", por isso não
  // apareciam antes.
  const regularesRealizadasHoje = vistorias.filter(
    (vistoria) => vistoria.status === "REALIZADA" && ehHoje(vistoria.concluidaEm)
  ).length;

  const missoesRealizadasHoje = missoesRealizadas.filter((missao) =>
    ehHoje(missao.dataRealizacao)
  ).length;

  const realizadas = regularesRealizadasHoje + missoesRealizadasHoje;

  const atrasadas =
    vistorias.filter(
      (vistoria) =>
        vistoria.status ===
        "ATRASADA"
    ).length;

  const total =
    vistorias.length;

  const cards = [

    {
      aba: "visao-geral",
      titulo: "Total",
      valor: total,
      cor: "text-[var(--text)]",
      fundo: "bg-[var(--surface-3)]",
    },

    {
      aba: "agendadas",
      titulo: "Programadas",
      valor: programadas,
      cor: "text-sky-400",
      fundo: "bg-sky-500/10",
    },

    {
      aba: "realizadas",
      titulo: "Realizadas hoje",
      valor: realizadas,
      cor: "text-emerald-400",
      fundo: "bg-emerald-500/10",
    },

    {
      aba: "atrasadas",
      titulo: "Atrasadas",
      valor: atrasadas,
      cor: "text-red-400",
      fundo: "bg-red-500/10",
    },

  ];

  return (

    // 2 colunas sempre (até no celular) -- 4 só teria espaço a partir
    // de telas bem largas. Cada card é um botão: clicar nele já troca
    // pra aba correspondente (Total -> Visão Geral, Atrasadas ->
    // Atrasadas...), sem precisar rolar até as abas.
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">

      {cards.map((card) => (

        <button
          key={card.titulo}
          type="button"
          onClick={() => setAbaSelecionada?.(card.aba)}
          className={`
            rounded-2xl
            border
            text-left
            p-4
            md:p-6
            transition-all
            duration-300
            ${
              abaSelecionada === card.aba
                ? "bg-[var(--surface)] border-emerald-400/70 ring-2 ring-emerald-400/70 shadow-[0_0_25px_rgba(16,185,129,.35)]"
                : "bg-[var(--surface)] border-[var(--border-token)] hover:border-emerald-500/30 hover:shadow-[0_0_35px_rgba(16,185,129,.08)]"
            }
          `}
        >

          <div className="flex items-center gap-3">

            <div
              className={`
                w-10
                h-10
                md:w-12
                md:h-12
                shrink-0
                rounded-xl
                flex
                items-center
                justify-center
                text-base
                md:text-lg
                font-black
                ${card.fundo}
                ${card.cor}
              `}
            >

              {card.valor}

            </div>

            <p
              className={`
                text-sm
                truncate
                ${
                  abaSelecionada === card.aba
                    ? "text-emerald-400 font-semibold"
                    : "text-[var(--text-subtle)]"
                }
              `}
            >
              {card.titulo}
            </p>

          </div>

        </button>

      ))}

    </div>

  );

}
