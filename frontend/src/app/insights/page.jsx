"use client";

import { Sparkles } from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import FadeIn from "../components/ui/FadeIn";
import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import SemPermissao from "../components/ui/SemPermissao";
import AssistenteChat from "../components/insights/AssistenteChat";

import { usePermissao } from "../../hooks/usePermissao";

export default function InsightsPage() {

  const podeVisualizar = usePermissao("insights.visualizar");
  const podeUsarSabado = usePermissao("sabado.usar");

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <div className="flex items-center gap-3">

              <div
                className="
                  w-12 h-12
                  rounded-2xl
                  bg-emerald-500/10
                  border border-emerald-500/20
                  flex items-center justify-center
                "
              >
                <Sparkles size={22} className="text-emerald-400" />
              </div>

              <div>
                <h1 className="text-4xl font-black text-[var(--text)]">
                  Assistente VIME
                </h1>
                <p className="text-[var(--text-subtle)]">
                  Converse com o SABADO sobre a operação.
                </p>
              </div>

            </div>

          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-6">
              {podeUsarSabado ? (
                <AssistenteChat />
              ) : (
                <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--text-muted)]">
                  Você não tem permissão para usar o Assistente VIME.
                </div>
              )}
            </div>
          </FadeIn>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
