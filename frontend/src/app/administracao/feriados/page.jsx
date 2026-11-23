"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Plus, Trash2 } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

import { FeriadoService } from "@/services/feriados.service";

const formatarData = (data) =>
  new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    weekday: "short",
    timeZone: "UTC",
  });

export default function FeriadosPage() {

  const router = useRouter();

  const anoAtual = new Date().getFullYear();

  const [ano, setAno] = useState(anoAtual);
  const [feriados, setFeriados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [novaData, setNovaData] = useState("");
  const [novoNome, setNovoNome] = useState("");

  const carregar = useCallback(async (anoAlvo) => {

    try {

      setCarregando(true);

      const resposta = await FeriadoService.listar(anoAlvo);

      setFeriados(resposta.data || []);

    } catch (err) {

      console.error("Erro ao carregar feriados:", err);
      alert(err.message || "Erro ao carregar feriados.");

    } finally {

      setCarregando(false);

    }

  }, []);

  useEffect(() => {

    carregar(ano);

  }, [ano, carregar]);

  async function adicionar(e) {

    e.preventDefault();

    if (!novaData || !novoNome.trim()) return;

    setSalvando(true);

    try {

      await FeriadoService.criar({ data: novaData, nome: novoNome.trim() });

      setNovaData("");
      setNovoNome("");

      await carregar(ano);

    } catch (err) {

      alert(err.message || "Erro ao adicionar feriado.");

    } finally {

      setSalvando(false);

    }

  }

  async function excluir(feriado) {

    if (!confirm(`Excluir o feriado "${feriado.nome}" (${formatarData(feriado.data)})?`)) {
      return;
    }

    try {

      await FeriadoService.excluir(feriado.id);

      await carregar(ano);

    } catch (err) {

      alert(err.message || "Erro ao excluir feriado.");

    }

  }

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <div className="flex items-center justify-between flex-wrap gap-4">

              <div>

                <h1 className="text-5xl font-black text-[var(--text)]">
                  Feriados
                </h1>

                <p className="text-[var(--text-subtle)]">
                  Usados pelos relógios de vencimento, atraso, corte de água/energia
                  e esvaziar kitnet — sábado, domingo e feriado não contam
                  (o zelador não trabalha nesses dias).
                </p>

              </div>

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

          </FadeIn>

          <PageSection spacing="xxl">

            <div className="grid lg:grid-cols-3 gap-6">

              <div className="lg:col-span-2">

                <Card>

                  <div className="flex items-center justify-between mb-5 flex-wrap gap-3">

                    <div className="flex items-center gap-3">
                      <CalendarDays size={18} className="text-emerald-400" />
                      <h2 className="text-lg font-bold text-[var(--text)]">
                        Calendário de {ano}
                      </h2>
                    </div>

                    <select
                      value={ano}
                      onChange={(e) => setAno(Number(e.target.value))}
                      className="rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] px-4 py-2 text-sm"
                    >
                      {[anoAtual - 1, anoAtual, anoAtual + 1, anoAtual + 2].map((a) => (
                        <option key={a} value={a} className="bg-[#1b2430]">{a}</option>
                      ))}
                    </select>

                  </div>

                  {carregando ? (

                    <p className="text-[var(--text-subtle)] text-center py-10">
                      Carregando...
                    </p>

                  ) : feriados.length === 0 ? (

                    <p className="text-[var(--text-subtle)] text-center py-10">
                      Nenhum feriado encontrado pra {ano}.
                    </p>

                  ) : (

                    <div className="space-y-2">

                      {feriados.map((f, i) => (

                        <div
                          key={f.id || `nacional-${i}`}
                          className="flex items-center justify-between rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] px-4 py-3"
                        >

                          <div className="flex items-center gap-3">

                            <span className="text-sm text-[var(--text-subtle)] w-28 shrink-0">
                              {formatarData(f.data)}
                            </span>

                            <span className="text-[var(--text)] font-medium">
                              {f.nome}
                            </span>

                            <Badge variant={f.origem === "NACIONAL" ? "blue" : "purple"}>
                              {f.origem === "NACIONAL" ? "Nacional" : "Adicional"}
                            </Badge>

                          </div>

                          {f.origem === "ADICIONAL" && (
                            <button
                              onClick={() => excluir(f)}
                              className="text-red-400 hover:text-red-300 p-2"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}

                        </div>

                      ))}

                    </div>

                  )}

                </Card>

              </div>

              <div>

                <Card>

                  <h2 className="text-lg font-bold text-[var(--text)] mb-2">
                    Adicionar feriado
                  </h2>

                  <p className="text-sm text-[var(--text-subtle)] mb-5">
                    Os nacionais já são calculados sozinhos (não precisam ser
                    cadastrados). Use isto só pra feriado estadual (ex.: Dia do
                    Servidor Público de GO) ou outro dia pontual que você queira
                    tratar como não-útil. Nunca feriado municipal.
                  </p>

                  <form onSubmit={adicionar} className="space-y-4">

                    <div>
                      <label className="text-sm text-[var(--text-subtle)] block mb-1">Data</label>
                      <input
                        type="date"
                        value={novaData}
                        onChange={(e) => setNovaData(e.target.value)}
                        required
                        className="w-full rounded-xl border border-[var(--border-token)] bg-[var(--surface-inset)] px-4 py-3 text-[var(--text)]"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-[var(--text-subtle)] block mb-1">Nome</label>
                      <input
                        type="text"
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        placeholder="Ex.: Dia do Servidor Público (GO)"
                        required
                        className="w-full rounded-xl border border-[var(--border-token)] bg-[var(--surface-inset)] px-4 py-3 text-[var(--text)]"
                      />
                    </div>

                    <Button type="submit" disabled={salvando} className="w-full flex items-center justify-center gap-2">
                      <Plus size={16} />
                      {salvando ? "Adicionando..." : "Adicionar"}
                    </Button>

                  </form>

                </Card>

              </div>

            </div>

          </PageSection>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
