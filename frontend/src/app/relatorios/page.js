"use client";

import { useMemo, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import RelatorioStats from "../components/relatorios/RelatorioStats";
import RelatorioFilters from "../components/relatorios/RelatorioFilters";
import RelatorioCards from "../components/relatorios/RelatorioCards";
import RelatorioExportar from "../components/relatorios/RelatorioExportar";
import FadeIn from "../components/ui/FadeIn";
import PageHeader from "../components/ui/PageHeader";
import PageSection from "../components/ui/PageSection";
import Button from "../components/ui/Button";
import SemPermissao from "../components/ui/SemPermissao";

import { usePermissao } from "../../hooks/usePermissao";

export default function RelatoriosPage() {

  const podeVisualizar = usePermissao("relatorios.visualizar");
  const podeExportar = usePermissao("relatorios.exportar");

  const [pesquisa, setPesquisa] =
    useState("");

  const modulos = useMemo(
      () => [
        "Residências",
        "Kitnets",
        "Locadores",
        "Inquilinos",
        "Contratos",
        "Solicitações",
        "Vistorias",
        "Financeiro",
      ],
      []
    );
  const resultados =
    useMemo(() => {

      return modulos.filter(

        (item) =>

          item
            .toLowerCase()
            .includes(
              pesquisa.toLowerCase()
            )

      );

    }, [modulos, pesquisa]);

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

 return (

  <MainLayout>

    <Page>

      <PageContainer>

        <FadeIn>

          <PageHeader
            title="Relatórios"
            subtitle="Visualize e exporte relatórios do sistema."
            count={modulos.length}
            countLabel="módulo(s) disponível(is)"
            actions={
              podeExportar && (
                <Button>
                  Exportar Tudo
                </Button>
              )
            }
          >

            <RelatorioFilters
              value={pesquisa}
              onChange={(e) =>
                setPesquisa(e.target.value)
              }
            />

          </PageHeader>

        </FadeIn>

        <FadeIn delay={0.10}>

          <PageSection spacing="xl">

            <RelatorioStats />

          </PageSection>

        </FadeIn>

        {pesquisa && (

          <FadeIn delay={0.15}>

            <PageSection spacing="lg">

              <div className="rounded-[22px] border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6">

                <h2 className="text-xl font-bold text-[var(--text)] mb-5">

                  Resultado da Pesquisa

                </h2>

                <div className="flex flex-wrap gap-3">

                  {resultados.length > 0 ? (

                    resultados.map((item) => (

                      <span
                        key={item}
                        className="
                          rounded-full
                          border
                          border-emerald-500/20
                          bg-emerald-500/10
                          px-4
                          py-2
                          text-sm
                          font-semibold
                          text-emerald-300
                        "
                      >
                        {item}
                      </span>

                    ))

                  ) : (

                    <span className="text-[var(--text-subtle)]">

                      Nenhum módulo encontrado.

                    </span>

                  )}

                </div>

              </div>

            </PageSection>

          </FadeIn>

        )}

        <FadeIn delay={0.20}>

          <PageSection spacing="xxl">

            <RelatorioCards />

          </PageSection>

        </FadeIn>

        {podeExportar && (

          <FadeIn delay={0.30}>

            <PageSection spacing="xxl">

              <RelatorioExportar />

            </PageSection>

          </FadeIn>

        )}

      </PageContainer>

    </Page>

  </MainLayout>

);
}