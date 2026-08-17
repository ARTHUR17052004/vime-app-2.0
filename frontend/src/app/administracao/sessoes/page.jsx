/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Circle, RefreshCw } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

import { SessaoService } from "@/services/sessao.service";

export default function SessoesPage() {

  const router = useRouter();

  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregarSessoes = useCallback(async () => {

    try {

      setLoading(true);

      const resposta = await SessaoService.listar();

      const lista = Array.isArray(resposta)
        ? resposta
        : resposta.data || [];

      setSessoes(lista);

    } catch (err) {

      console.error(err);

      setErro(
        err.message ||
        "Erro ao carregar sessões."
      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    carregarSessoes();

    const intervalo = setInterval(carregarSessoes, 15000);

    return () => clearInterval(intervalo);

  }, [carregarSessoes]);

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <div className="flex items-center justify-between">

              <div>

                <h1 className="text-5xl font-black text-[var(--text)]">
                  Sessões
                </h1>

                <p className="text-[var(--text-subtle)]">
                  Usuários conectados agora em tempo real
                </p>

              </div>

              <div className="flex gap-3">

                <button
                  onClick={carregarSessoes}
                  className="
                    px-5
                    py-3
                    rounded-xl
                    bg-[var(--surface-3)]
                    hover:bg-[var(--surface-3)]
                    text-[var(--text)]
                    flex
                    items-center
                    gap-2
                  "
                >
                  <RefreshCw size={18} />
                  Atualizar
                </button>

                <button
                  onClick={() => router.back()}
                  className="
                    px-5
                    py-3
                    rounded-xl
                    bg-[var(--surface-3)]
                    hover:bg-[var(--surface-3)]
                    text-[var(--text)]
                    flex
                    items-center
                    gap-2
                  "
                >
                  <ArrowLeft size={18} />
                  Voltar
                </button>

              </div>

            </div>

          </FadeIn>

          {erro && (

            <div
              className="
                mb-6
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/10
                px-5
                py-4
                text-red-300
              "
            >
              {erro}
            </div>

          )}

          <PageSection spacing="xxl">

            {loading ? (

              <Card>
                <p className="text-[var(--text-subtle)] text-center py-10">
                  Carregando...
                </p>
              </Card>

            ) : sessoes.length === 0 ? (

              <Card>
                <p className="text-[var(--text-subtle)] text-center py-10">
                  Nenhum usuário conectado agora.
                </p>
              </Card>

            ) : (

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

                {sessoes.map((sessao) => (

                  <Card key={sessao.id}>

                    <div className="flex items-start justify-between">

                      <div>

                        <h3 className="text-lg font-bold text-[var(--text)]">
                          {sessao.nome}
                        </h3>

                        <p className="text-[var(--text-subtle)] text-sm mt-1">
                          {sessao.email}
                        </p>

                        <p className="text-[var(--text-faint)] text-xs mt-1">
                          {sessao.perfil}
                        </p>

                      </div>

                      <Badge variant="emerald">
                        <Circle
                          size={8}
                          className="fill-emerald-400 text-emerald-400 mr-1"
                        />
                        Online
                      </Badge>

                    </div>

                    <p className="text-[var(--text-faint)] text-xs mt-5">
                      Conectado desde{" "}
                      {new Date(sessao.conectadoEm).toLocaleTimeString("pt-BR")}
                    </p>

                  </Card>

                ))}

              </div>

            )}

          </PageSection>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
