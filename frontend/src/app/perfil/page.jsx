"use client";

import MainLayout from "../components/layout/MainLayout";

import ProfileCard from "../components/perfil/ProfileCard";
import ProfileInfo from "../components/perfil/ProfileInfo";
import ProfileActions from "../components/perfil/ProfileActions";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import FadeIn from "../components/ui/FadeIn";

export default function PerfilPage() {
  return (
    <MainLayout>
      <Page>
        <PageContainer>

          <FadeIn>

            <div className="space-y-8">

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.35em]
                    text-emerald-400
                    font-semibold
                  "
                >
                  Usuário
                </p>

                <h1
                  className="
                    mt-2
                    text-4xl
                    font-bold
                    text-[var(--text)]
                  "
                >
                  Meu Perfil
                </h1>

                <p className="mt-3 text-[var(--text-subtle)]">
                  Gerencie suas informações e preferências da conta.
                </p>

              </div>

              <div className="grid grid-cols-12 gap-8">

                <div className="col-span-12 xl:col-span-4">

                  <ProfileCard />

                </div>

                <div className="col-span-12 xl:col-span-8 space-y-8">

                  <ProfileInfo />

                  <ProfileActions />

                </div>

              </div>

            </div>

          </FadeIn>

        </PageContainer>
      </Page>
    </MainLayout>
  );
}