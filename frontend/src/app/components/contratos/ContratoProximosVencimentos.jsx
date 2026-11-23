"use client";

import Link from "next/link";
import { CalendarClock, RefreshCw, Ban } from "lucide-react";

import DashboardCard from "../dashboard/DashboardCard";
import Badge from "../ui/Badge";
import { usePermissao } from "../../../hooks/usePermissao";

// Urgência pra decidir "vou renovar ou não" -- quanto mais perto do
// fim do contrato (dataFim), mais vermelho. Mesmo corte de 10 dias já
// usado no filtro "Vencendo" da aba Contratos (ver contratos/page.js),
// só que aqui mostrando TODOS os contratos ativos com dataFim,
// ordenados do mais próximo pro mais distante -- não só quem já entrou
// nos 10 dias.
function calcularUrgencia(diasRestantes) {
  if (diasRestantes < 0) return { variant: "red", texto: "Venceu" };
  if (diasRestantes <= 10) return { variant: "red", texto: `${diasRestantes}d restante${diasRestantes === 1 ? "" : "s"}` };
  if (diasRestantes <= 30) return { variant: "yellow", texto: `${diasRestantes}d restantes` };
  return { variant: "emerald", texto: `${diasRestantes}d restantes` };
}

export default function ContratoProximosVencimentos({
  contratos,
  onRenovar,
  onEncerrar,
}) {

  const podeEditar = usePermissao("contratos.editar");

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Isso aqui é sobre o FIM do contrato (dataFim) -- pra decidir
  // renovar ou não -- não confundir com o dia de vencimento mensal do
  // aluguel (diaVencimento), que já tem sua própria coluna na aba
  // Contratos. Só ATIVO entra: PENDENTE ainda nem começou, ENCERRADO
  // já é passado.
  const contratosVencendo = contratos
    .filter((c) => c.status === "ATIVO" && c.dataFim)
    .map((c) => {
      const fim = new Date(c.dataFim);
      fim.setHours(0, 0, 0, 0);
      const diasRestantes = Math.round((fim - hoje) / (1000 * 60 * 60 * 24));
      return { ...c, _fim: fim, _diasRestantes: diasRestantes };
    })
    .sort((a, b) => a._fim - b._fim);

  return (
    <DashboardCard>

      <div className="flex items-center gap-4 mb-8">

        <div
          className="
            w-14
            h-14

            rounded-2xl

            flex
            items-center
            justify-center

            bg-emerald-500/10

            border
            border-emerald-500/20
          "
        >
          <CalendarClock
            size={28}
            className="text-emerald-400"
          />
        </div>

        <div>

          <h2
            className="
              text-3xl
              font-black
              text-[var(--text)]
            "
          >
            Próximos Vencimentos
          </h2>

          <p className="text-[var(--text-subtle)]">
            Contratos ativos ordenados por data de fim -- pra decidir renovar ou não
          </p>

        </div>

      </div>

      {contratosVencendo.length === 0 ? (

        <div
          className="
            py-16

            text-center

            text-[var(--text-faint)]
          "
        >
          Nenhum contrato ativo com data de fim cadastrada.
        </div>

      ) : (

        <div className="space-y-5">

          {contratosVencendo.map((contrato) => {

            const urgencia = calcularUrgencia(contrato._diasRestantes);

            return (

              <div
                key={contrato.id}
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-4

                  rounded-2xl

                  border
                  border-[var(--border-token)]

                  bg-[var(--surface-2)]

                  px-6
                  py-5

                  transition-all
                  duration-300

                  hover:bg-[var(--surface-2)]
                "
              >

                <div>

                  <Link
                    href={`/contratos/${contrato.id}`}
                    className="text-lg font-bold text-[var(--text)] hover:text-emerald-400 transition"
                  >
                    {contrato.inquilino?.nome || contrato.inquilinoNome}
                  </Link>

                  <p className="text-[var(--text-subtle)]">
                    {contrato.unidade?.nome || contrato.unidadeNome}
                    {" -- "}
                    {contrato.kitnet?.nome || contrato.kitnetNome}
                  </p>

                </div>

                <div className="flex items-center gap-6">

                  <div className="text-right">

                    <p
                      className="
                        text-xl
                        font-bold
                        text-emerald-400
                      "
                    >
                      R$ {Number(contrato.valorAluguel || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>

                    <p className="text-[var(--text-subtle)]">
                      Fim: {contrato._fim.toLocaleDateString("pt-BR")}
                    </p>

                  </div>

                  <Badge variant={urgencia.variant} size="lg">
                    {urgencia.texto}
                  </Badge>

                  {podeEditar && (

                    <div className="flex items-center gap-2">

                      <button
                        onClick={() => onRenovar?.(contrato.id)}
                        title="Renovar contrato"
                        className="
                          flex
                          items-center
                          justify-center

                          w-10
                          h-10

                          rounded-xl

                          bg-emerald-500/10
                          border
                          border-emerald-500/20

                          text-emerald-400

                          hover:bg-emerald-500/20
                          transition
                        "
                      >
                        <RefreshCw size={18} />
                      </button>

                      <button
                        onClick={() => onEncerrar?.(contrato.id)}
                        title="Encerrar contrato"
                        className="
                          flex
                          items-center
                          justify-center

                          w-10
                          h-10

                          rounded-xl

                          bg-red-500/10
                          border
                          border-red-500/20

                          text-red-400

                          hover:bg-red-500/20
                          transition
                        "
                      >
                        <Ban size={18} />
                      </button>

                    </div>

                  )}

                </div>

              </div>

            );

          })}

        </div>

      )}

    </DashboardCard>
  );
}
