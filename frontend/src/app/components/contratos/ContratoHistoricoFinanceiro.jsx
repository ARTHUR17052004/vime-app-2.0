"use client";

import { useEffect, useState } from "react";

import { ReceitaService } from "@/services/financeiro.service";

export default function ContratoHistoricoFinanceiro({
  contratoId,
}) {

  const [receitasContrato, setReceitasContrato] =
    useState([]);

  const [carregando, setCarregando] =
    useState(true);

  useEffect(() => {

    async function carregar() {

      try {

        const resposta = await ReceitaService.listar();

        const lista = Array.isArray(resposta)
          ? resposta
          : resposta.data || [];

        setReceitasContrato(
          lista.filter(
            (receita) =>
              String(receita.contratoId) === String(contratoId)
          )
        );

      } catch (err) {

        console.error("Erro ao carregar histórico financeiro:", err);

      } finally {

        setCarregando(false);

      }

    }

    carregar();

  }, [contratoId]);

  return (
    <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

      <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
        Histórico Financeiro
      </h2>

      {carregando ? (

        <div className="text-[var(--text-subtle)]">
          Carregando...
        </div>

      ) : receitasContrato.length === 0 ? (

        <div className="text-[var(--text-subtle)]">
          Nenhuma movimentação encontrada.
        </div>

      ) : (

        <div className="space-y-4">

          {receitasContrato.map(
            (receita) => (

              <div
                key={receita.id}
                className="
                  border
                  border-[var(--border-token)]
                  rounded-2xl
                  p-5
                  flex
                  justify-between
                  items-center
                "
              >

                <div>

                  <h3 className="font-semibold text-[var(--text)]">
                    {receita.descricao}
                  </h3>

                  <div className="text-sm text-[var(--text-subtle)]">
                    {receita.categoria}
                  </div>

                </div>

                <div className="text-right">

                  <div className="font-bold text-green-700">
                    R$ {receita.valor}
                  </div>

                  <div
                    className={`
                      text-sm
                      ${
                        receita.status ===
                        "PAGO"
                          ? "text-green-600"
                          : "text-orange-600"
                      }
                    `}
                  >
                    {receita.status}
                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}
