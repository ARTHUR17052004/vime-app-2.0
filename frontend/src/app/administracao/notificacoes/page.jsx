/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BellRing, Smartphone } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import SemPermissao from "../../components/ui/SemPermissao";

import { NotificacaoService } from "@/services/notificacao.service";
import { usePermissao } from "@/hooks/usePermissao";

function Interruptor({ ligado, onChange, desabilitado, rotulo }) {
  return (
    <button
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      disabled={desabilitado}
      onClick={() => onChange(!ligado)}
      className={`
        shrink-0
        relative
        w-12
        h-7
        rounded-full
        transition
        ${ligado ? "bg-emerald-500" : "bg-[var(--surface-3)]"}
        ${desabilitado ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      <span
        className={`
          absolute
          top-0.5
          w-6
          h-6
          rounded-full
          bg-white
          transition-all
          ${ligado ? "left-[22px]" : "left-0.5"}
        `}
      />
    </button>
  );
}

export default function NotificacoesAdminPage() {

  const router = useRouter();

  const podeVisualizar = usePermissao("configuracoes.visualizar");
  const podeEditar = usePermissao("configuracoes.editar");

  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {

    try {

      setLoading(true);
      setErro("");

      const resposta = await NotificacaoService.listarConfig();
      setTipos(resposta.data || []);

    } catch (err) {

      setErro(err.message || "Erro ao carregar as notificações.");

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {
    if (podeVisualizar) carregar();
  }, [podeVisualizar, carregar]);

  // Salva na hora (cada toque já vale) e desfaz na tela se o servidor recusar.
  async function alterar(chave, campo, valor) {

    const anteriores = tipos;

    setTipos((atual) =>
      atual.map((t) => (t.chave === chave ? { ...t, [campo]: valor } : t))
    );

    try {
      await NotificacaoService.atualizarConfig(chave, { [campo]: valor });
    } catch (err) {
      setTipos(anteriores);
      setErro(err.message || "Não foi possível salvar.");
    }

  }

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  const grupos = tipos.reduce((mapa, t) => {
    (mapa[t.grupo] = mapa[t.grupo] || []).push(t);
    return mapa;
  }, {});

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <div className="flex items-start gap-4 flex-wrap mb-6">

              <Button
                variant="secondary"
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => router.push("/administracao")}
              >
                Voltar
              </Button>

              <div className="flex-1 min-w-[240px]">
                <h1 className="text-3xl font-bold text-[var(--text)]">
                  Notificações
                </h1>
                <p className="mt-1 text-sm text-[var(--text-subtle)]">
                  Escolha o que o sistema avisa. <b>Notificar</b> desligado = o
                  aviso nem é criado. <b>Celular</b> desligado = aparece só
                  dentro do sistema, sem mandar para o celular. Vale para todos
                  os usuários.
                </p>
              </div>

            </div>

          </FadeIn>

          {erro && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
              {erro}
            </div>
          )}

          {loading && (
            <p className="mt-10 text-center text-[var(--text-subtle)]">
              Carregando...
            </p>
          )}

          {!loading && Object.entries(grupos).map(([grupo, lista], i) => (

            <FadeIn key={grupo} delay={0.05 * (i + 1)}>

              <PageSection spacing="lg">

                <Card padding="none">

                  <div className="px-5 py-4 border-b border-[var(--border-token)]">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-subtle)]">
                      {grupo}
                    </p>
                  </div>

                  <div className="px-5">

                    {lista.map((t) => (

                      <div
                        key={t.chave}
                        className="
                          py-4
                          border-b
                          border-[var(--border-token)]
                          last:border-b-0
                          flex
                          items-center
                          gap-4
                          flex-wrap
                        "
                      >

                        <div className="flex-1 min-w-[220px]">
                          <p className="text-[15px] font-semibold text-[var(--text)]">
                            {t.rotulo}
                          </p>
                          <p className="mt-0.5 text-sm text-[var(--text-subtle)]">
                            {t.descricao}
                          </p>
                        </div>

                        <div className="flex items-center gap-6">

                          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <BellRing size={15} />
                            Notificar
                            <Interruptor
                              ligado={t.ativo}
                              desabilitado={!podeEditar}
                              rotulo={`Notificar: ${t.rotulo}`}
                              onChange={(v) => alterar(t.chave, "ativo", v)}
                            />
                          </label>

                          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                            <Smartphone size={15} />
                            Celular
                            <Interruptor
                              ligado={t.ativo && t.push}
                              desabilitado={!podeEditar || !t.ativo}
                              rotulo={`Enviar para o celular: ${t.rotulo}`}
                              onChange={(v) => alterar(t.chave, "push", v)}
                            />
                          </label>

                        </div>

                      </div>

                    ))}

                  </div>

                </Card>

              </PageSection>

            </FadeIn>

          ))}

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
