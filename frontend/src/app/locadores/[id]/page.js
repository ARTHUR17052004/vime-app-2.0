"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import MainLayout from "../../components/layout/MainLayout";
import SemPermissao from "../../components/ui/SemPermissao";

import { LocadorService } from "@/services/locadores.service";
import { UnidadeService } from "@/services/unidades.service";
import { usePermissao } from "../../../hooks/usePermissao";

export default function DetalhesLocadorPage() {
  const params = useParams();

  const podeVisualizar = usePermissao("locadores.visualizar");

  const [locador, setLocador] = useState(null);
  const [totalUnidades, setTotalUnidades] =
    useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function carregarLocador() {

      try {

        setLoading(true);

        const [respostaLocadores, respostaUnidades] =
          await Promise.all([
            LocadorService.listar(),
            UnidadeService.listar(),
          ]);

        const locadores = Array.isArray(respostaLocadores)
          ? respostaLocadores
          : respostaLocadores.data || [];

        const unidades = Array.isArray(respostaUnidades)
          ? respostaUnidades
          : respostaUnidades.data || [];

        const encontrado = locadores.find(
          (item) =>
            String(item.id) ===
            String(params.id)
        );

        setLocador(encontrado || null);

        if (encontrado) {
          const quantidade =
            unidades.filter(
              (u) =>
                String(u.locadorId) ===
                String(encontrado.id)
            ).length;

          setTotalUnidades(quantidade);
        }

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    }

    if (params.id) {
      carregarLocador();
    }

  }, [params.id]);

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] text-[var(--text-1)] rounded-3xl p-10">
          Carregando locador...
        </div>
      </MainLayout>
    );
  }

  if (!locador) {
    return (
      <MainLayout>
        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] text-[var(--text-1)] rounded-3xl p-10">
          Locador não encontrado.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-10">

        <h1 className="text-4xl font-bold text-[var(--text)] mb-2">
          {locador.nome}
        </h1>

        <p className="text-[var(--text-subtle)] mb-10">
          Detalhes do Locador
        </p>

        <div className="grid md:grid-cols-2 gap-10">

          <div>
            <p className="text-[var(--text-subtle)]">
              Tipo
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {locador.tipoPessoa === "PJ"
                ? "Pessoa Jurídica"
                : "Pessoa Física"}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Documento
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {locador.documento || "-"}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              E-mail
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {locador.email || "-"}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Telefone
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {locador.telefone || "-"}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Banco
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {locador.banco || "-"}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Agência
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {locador.agencia || "-"}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Conta
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {locador.conta || "-"}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Chave PIX
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {locador.pix || "-"}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Taxa Administração
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {locador.taxaAdministracao || 0}%
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Multa
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {locador.multa || 0}%
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Juros
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {locador.juros || 0}% a.m.
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Residências Vinculadas
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {totalUnidades}
            </h2>
          </div>

        </div>

        <div className="mt-10">
          <p className="text-[var(--text-subtle)] mb-2">
            Observações
          </p>

          <div className="bg-[var(--surface-2)] border border-[var(--border-token)] text-[var(--text-1)] rounded-2xl p-6">
            {locador.observacoes ||
              "Nenhuma observação cadastrada."}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}