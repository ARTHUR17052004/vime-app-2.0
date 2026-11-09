"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCheck, Eye, TriangleAlert } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";

import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";
import PageHeader from "../../components/ui/PageHeader";
import PageGrid from "../../components/ui/PageGrid";
import DashboardStatsCard from "../../components/dashboard/DashboardStatsCard";
import Badge from "../../components/ui/Badge";
import SemPermissao from "../../components/ui/SemPermissao";
import SearchInput from "../../components/common/SearchInput";

import { WhatsappService } from "../../../services/whatsapp.service";
import { usePermissao } from "../../../hooks/usePermissao";

const ROTULO_STATUS = {
  enviada: { texto: "Enviada", variant: "gray" },
  entregue: { texto: "Entregue", variant: "blue" },
  lida: { texto: "Lida", variant: "emerald" },
  falhou: { texto: "Falhou", variant: "red" },
};

export default function WhatsappRelatorioPage() {

  const podeVisualizar = usePermissao("whatsapp.relatorio");

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [resumo, setResumo] = useState({ total: 0, enviada: 0, entregue: 0, lida: 0, falhou: 0 });
  const [mensagens, setMensagens] = useState([]);

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [dataDe, setDataDe] = useState("");
  const [dataAte, setDataAte] = useState("");

  async function carregar() {

    try {

      setLoading(true);
      setErro("");

      const resposta = await WhatsappService.relatorio({
        status: statusFiltro,
        dataDe,
        dataAte,
        busca,
      });

      const dados = resposta.data || resposta;

      setResumo(dados.resumo || { total: 0, enviada: 0, entregue: 0, lida: 0, falhou: 0 });
      setMensagens(dados.mensagens || []);

    } catch (err) {

      console.error(err);
      setErro(err.message || "Erro ao carregar o relatório.");

    } finally {

      setLoading(false);

    }

  }

  // Busca/filtro é por digitação (sem botão "aplicar") -- debounce curto
  // pra não disparar uma chamada por tecla.
  useEffect(() => {

    if (!podeVisualizar) return;

    const atraso = setTimeout(carregar, 350);
    return () => clearTimeout(atraso);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, statusFiltro, dataDe, dataAte, podeVisualizar]);

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  const entregaOuMelhor = resumo.entregue + resumo.lida;
  const taxaFalha = resumo.total > 0 ? Math.round((resumo.falhou / resumo.total) * 100) : 0;

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <Link
              href="/whatsapp"
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                text-sm
                text-[var(--text-subtle)]
                hover:text-[var(--text)]
                transition
              "
            >
              <ArrowLeft size={14} />
              Voltar para WhatsApp
            </Link>

            <PageHeader
              title="Relatório de Mensagens"
              subtitle="Todas as mensagens enviadas pelo sistema -- o que foi entregue, lido e o que falhou."
            />

          </FadeIn>

          <FadeIn delay={0.1}>

            <PageSection>

              <PageGrid cols={4}>

                <DashboardStatsCard
                  title="Enviadas"
                  value={resumo.total}
                  subtitle={`No período filtrado`}
                  icon={Send}
                />

                <DashboardStatsCard
                  title="Entregues"
                  value={entregaOuMelhor}
                  subtitle="Chegou no aparelho (entregue + lida)"
                  icon={CheckCheck}
                />

                <DashboardStatsCard
                  title="Lidas"
                  value={resumo.lida}
                  subtitle="Confirmado que a pessoa viu"
                  icon={Eye}
                />

                <DashboardStatsCard
                  title="Falharam"
                  value={resumo.falhou}
                  subtitle={resumo.total > 0 ? `${taxaFalha}% do total enviado` : "Nenhuma falha"}
                  icon={TriangleAlert}
                />

              </PageGrid>

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.15}>

            <PageSection>

              <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-[var(--text-faint)] mb-1.5">Buscar</label>
                    <SearchInput
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Nome ou número do contato..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--text-faint)] mb-1.5">Status</label>
                    <select
                      value={statusFiltro}
                      onChange={(e) => setStatusFiltro(e.target.value)}
                      className="w-full h-11 border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl px-3 text-sm"
                    >
                      <option value="" className="bg-[#1b2430]">Todas</option>
                      <option value="enviada" className="bg-[#1b2430]">Enviada</option>
                      <option value="entregue" className="bg-[#1b2430]">Entregue</option>
                      <option value="lida" className="bg-[#1b2430]">Lida</option>
                      <option value="falhou" className="bg-[#1b2430]">Falhou</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">

                    <div>
                      <label className="block text-xs text-[var(--text-faint)] mb-1.5">De</label>
                      <input
                        type="date"
                        value={dataDe}
                        onChange={(e) => setDataDe(e.target.value)}
                        className="w-full h-11 border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl px-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[var(--text-faint)] mb-1.5">Até</label>
                      <input
                        type="date"
                        value={dataAte}
                        onChange={(e) => setDataAte(e.target.value)}
                        className="w-full h-11 border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl px-3 text-sm"
                      />
                    </div>

                  </div>

                </div>

              </div>

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.2}>

            <PageSection>

              <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl overflow-hidden">

                {erro && (
                  <div className="p-6 text-sm text-red-400">{erro}</div>
                )}

                {!erro && loading && (
                  <div className="p-10 text-center text-[var(--text-subtle)]">Carregando...</div>
                )}

                {!erro && !loading && mensagens.length === 0 && (
                  <div className="p-10 text-center text-[var(--text-subtle)]">
                    Nenhuma mensagem encontrada com esses filtros.
                  </div>
                )}

                {!erro && !loading && mensagens.length > 0 && (

                  <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-[var(--text-faint)] border-b border-[var(--border-token)]">
                          <th className="px-5 py-3 font-semibold">Contato</th>
                          <th className="px-5 py-3 font-semibold">Mensagem</th>
                          <th className="px-5 py-3 font-semibold">Data</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {mensagens.map((m) => {

                          const status = ROTULO_STATUS[m.status] || ROTULO_STATUS.enviada;

                          return (
                            <tr
                              key={m.id}
                              className="border-b border-[var(--border-token)] last:border-0 hover:bg-[var(--surface-2)] transition"
                            >
                              <td className="px-5 py-3 min-w-0">
                                <p className="font-semibold text-[var(--text)] truncate">
                                  {m.contato?.nome || m.contato?.telefone || "Contato"}
                                </p>
                                <p className="text-xs text-[var(--text-faint)]">{m.contato?.telefone}</p>
                              </td>
                              <td className="px-5 py-3 max-w-xs">
                                <p className="truncate text-[var(--text-subtle)]">{m.texto}</p>
                                {m.status === "falhou" && m.erroDetalhe && (
                                  <p className="text-xs text-red-400 truncate mt-0.5">{m.erroDetalhe}</p>
                                )}
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap text-[var(--text-subtle)]">
                                {new Date(m.createdAt).toLocaleString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="px-5 py-3">
                                <Badge variant={status.variant}>{status.texto}</Badge>
                              </td>
                            </tr>
                          );

                        })}
                      </tbody>

                    </table>

                  </div>

                )}

                {!erro && !loading && mensagens.length >= 500 && (
                  <div className="px-5 py-3 text-xs text-[var(--text-faint)] border-t border-[var(--border-token)]">
                    Mostrando as 500 mais recentes -- estreite o período ou a busca pra ver menos de uma vez.
                  </div>
                )}

              </div>

            </PageSection>

          </FadeIn>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
