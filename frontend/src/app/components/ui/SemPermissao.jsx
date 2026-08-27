"use client";

import { Lock } from "lucide-react";

import MainLayout from "../layout/MainLayout";
import Page from "./Page";
import PageContainer from "./PageContainer";
import FadeIn from "./FadeIn";

// Bloqueio de página inteira pra quem não tem o "<modulo>.visualizar"
// daquela tela -- mesmo padrão visual do EmptyState, mas com o aviso
// de acesso restrito em vez de "nada cadastrado ainda".
export default function SemPermissao({
  titulo = "Acesso restrito",
  descricao = "Seu perfil não tem permissão para ver esta página. Fale com um administrador se precisar de acesso.",
}) {

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <div
              className="
                rounded-3xl
                border
                border-red-500/20
                bg-[var(--surface)]
                backdrop-blur-xl
                shadow-[0_8px_20px_rgba(0,0,0,.18)]
                py-20
                px-10
                flex
                flex-col
                items-center
                justify-center
                text-center
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-center
                  w-24
                  h-24
                  rounded-full
                  bg-red-500/10
                  border
                  border-red-500/20
                  text-red-400
                "
              >
                <Lock size={44} />
              </div>

              <h2 className="mt-8 text-3xl font-bold text-[var(--text)]">
                {titulo}
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-[var(--text-subtle)]">
                {descricao}
              </p>

            </div>

          </FadeIn>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
