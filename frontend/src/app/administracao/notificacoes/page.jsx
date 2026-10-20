/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BellRing, Smartphone, ChevronDown, Pencil, Users, RotateCcw } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import SemPermissao from "../../components/ui/SemPermissao";

import { NotificacaoService } from "@/services/notificacao.service";
import { PerfilService } from "@/services/perfis.service";
import { useAuth } from "@/context/AuthContext";

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

  // Escolha do que notificar vale pra empresa toda: só o administrador
  // geral (sem locador definido) mexe -- o servidor também confere.
  const { usuario } = useAuth();
  const podeVisualizar = usuario?.perfil === "ADMINISTRADOR" && !usuario?.locadorId;
  const podeEditar = podeVisualizar;

  const [tipos, setTipos] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [expandido, setExpandido] = useState(null);
  const [rascunhoMensagem, setRascunhoMensagem] = useState("");
  const [salvandoMensagem, setSalvandoMensagem] = useState(false);

  const carregar = useCallback(async () => {

    try {

      setLoading(true);
      setErro("");

      const [respostaTipos, respostaPerfis] = await Promise.all([
        NotificacaoService.listarConfig(),
        PerfilService.listar(),
      ]);

      setTipos(respostaTipos.data || []);
      setPerfis(Array.isArray(respostaPerfis) ? respostaPerfis : respostaPerfis.data || []);

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

  // Na tela todo perfil nasce marcado (= todo mundo recebe); desmarcar
  // tira só aquele. Por baixo o campo continua sendo a lista de quem
  // RECEBE (vazio = todos, sem precisar listar perfil por perfil) -- se
  // o resultado de desmarcar voltar a cobrir todo mundo, simplificamos
  // de volta pra [] pra continuar pegando perfis novos automaticamente.
  function alternarPerfil(tipo, nomePerfil) {

    const todosNomes = perfis.map((p) => p.nome);
    const atual = tipo.perfis?.length > 0 ? tipo.perfis : todosNomes;

    const novo = atual.includes(nomePerfil)
      ? atual.filter((p) => p !== nomePerfil)
      : [...atual, nomePerfil];

    const final =
      todosNomes.length > 0 && todosNomes.every((n) => novo.includes(n))
        ? []
        : novo;

    alterar(tipo.chave, "perfis", final);

  }

  function abrirEdicaoMensagem(tipo) {

    if (expandido === tipo.chave) {
      setExpandido(null);
      return;
    }

    setExpandido(tipo.chave);
    setRascunhoMensagem(tipo.mensagemTemplate || "");

  }

  async function salvarMensagem(tipo) {

    setSalvandoMensagem(true);

    try {

      await NotificacaoService.atualizarConfig(tipo.chave, { mensagemTemplate: rascunhoMensagem });

      setTipos((atual) =>
        atual.map((t) => (t.chave === tipo.chave ? { ...t, mensagemTemplate: rascunhoMensagem || null } : t))
      );

    } catch (err) {

      setErro(err.message || "Não foi possível salvar a mensagem.");

    } finally {

      setSalvandoMensagem(false);

    }

  }

  async function restaurarMensagemPadrao(tipo) {
    setRascunhoMensagem("");
    await salvarMensagem({ ...tipo, mensagemTemplate: "" });
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
                  dentro do sistema, sem mandar para o celular. Clique no lápis
                  pra personalizar o texto do aviso ou escolher pra quais
                  perfis ele vale (em branco = todos os perfis).
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
                        "
                      >

                        <div
                          className="
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
                            {t.perfis?.length > 0 && (
                              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
                                <Users size={13} />
                                Só para: {t.perfis.join(", ")}
                              </p>
                            )}
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

                            {podeEditar && t.mensagemPadrao && (
                              <button
                                onClick={() => abrirEdicaoMensagem(t)}
                                title="Personalizar mensagem e perfis"
                                className={`
                                  p-2
                                  rounded-lg
                                  border
                                  border-[var(--border-token)]
                                  text-[var(--text-subtle)]
                                  hover:bg-[var(--surface-2)]
                                  hover:text-[var(--text)]
                                  transition
                                `}
                              >
                                <Pencil size={15} />
                              </button>
                            )}

                            {podeEditar && t.mensagemPadrao && (
                              <button
                                onClick={() => abrirEdicaoMensagem(t)}
                                className="p-1 text-[var(--text-faint)]"
                              >
                                <ChevronDown
                                  size={16}
                                  className={`transition-transform ${expandido === t.chave ? "rotate-180" : ""}`}
                                />
                              </button>
                            )}

                          </div>

                        </div>

                        {expandido === t.chave && (

                          <div className="mt-4 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4 space-y-4">

                            <div>

                              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                                Mensagem personalizada
                              </label>

                              <textarea
                                value={rascunhoMensagem}
                                onChange={(e) => setRascunhoMensagem(e.target.value)}
                                placeholder={t.mensagemPadrao}
                                rows={3}
                                disabled={!podeEditar}
                                className="
                                  w-full
                                  rounded-lg
                                  border
                                  border-[var(--border-token)]
                                  bg-[var(--surface)]
                                  px-3
                                  py-2
                                  text-sm
                                  text-[var(--text)]
                                  outline-none
                                  focus:border-emerald-500
                                  resize-none
                                "
                              />

                              <p className="mt-1.5 text-xs text-[var(--text-faint)]">
                                Variáveis disponíveis: {t.variaveis.map((v) => `{{${v}}}`).join(", ")}.
                                {" "}Em branco = usa o texto padrão mostrado acima como exemplo.
                              </p>

                              <div className="flex gap-2 mt-3">

                                <Button
                                  size="sm"
                                  disabled={!podeEditar || salvandoMensagem}
                                  onClick={() => salvarMensagem(t)}
                                >
                                  {salvandoMensagem ? "Salvando..." : "Salvar mensagem"}
                                </Button>

                                {t.mensagemTemplate && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    leftIcon={<RotateCcw size={14} />}
                                    disabled={!podeEditar || salvandoMensagem}
                                    onClick={() => restaurarMensagemPadrao(t)}
                                  >
                                    Voltar ao padrão
                                  </Button>
                                )}

                              </div>

                            </div>

                            <div className="border-t border-[var(--border-token)] pt-4">

                              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2">
                                Quem recebe (desmarque quem não deve receber)
                              </label>

                              <div className="flex flex-wrap gap-2">

                                {perfis.map((p) => {

                                  const marcado = (t.perfis?.length > 0 ? t.perfis : perfis.map((x) => x.nome)).includes(p.nome);

                                  return (
                                    <button
                                      key={p.id}
                                      disabled={!podeEditar}
                                      onClick={() => alternarPerfil(t, p.nome)}
                                      className={`
                                        px-3
                                        py-1.5
                                        rounded-full
                                        text-xs
                                        font-semibold
                                        border
                                        transition
                                        ${marcado
                                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                          : "bg-[var(--surface)] border-[var(--border-token)] text-[var(--text-muted)] hover:border-emerald-500/30"
                                        }
                                      `}
                                    >
                                      {p.nome}
                                    </button>
                                  );

                                })}

                              </div>

                            </div>

                          </div>

                        )}

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
