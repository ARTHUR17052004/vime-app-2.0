"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

import { ModeloDocumentoService } from "@/services/modeloDocumento.service";
import {
  PLACEHOLDERS_CONTRATO,
  MODELO_PADRAO_CONTRATO,
} from "@/utils/gerarContratoPdf";

export default function ModelosDocumentoPage() {

  const router = useRouter();

  const [conteudo, setConteudo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {

    try {

      setCarregando(true);

      const resposta = await ModeloDocumentoService.buscar("CONTRATO");

      const modelo = resposta.data;

      setConteudo(modelo?.conteudo || MODELO_PADRAO_CONTRATO);

    } catch (err) {

      console.error("Erro ao carregar modelo:", err);

      setConteudo(MODELO_PADRAO_CONTRATO);

    } finally {

      setCarregando(false);

    }

  }, []);

  useEffect(() => {

    carregar();

  }, [carregar]);

  async function salvar() {

    setSalvando(true);

    try {

      await ModeloDocumentoService.salvar("CONTRATO", {
        conteudo,
      });

      alert("Modelo salvo com sucesso.");

    } catch (err) {

      alert(err.message || "Erro ao salvar modelo.");

    } finally {

      setSalvando(false);

    }

  }

  function restaurarPadrao() {

    if (
      !confirm(
        "Restaurar o modelo padrão? As alterações não salvas serão perdidas."
      )
    ) {
      return;
    }

    setConteudo(MODELO_PADRAO_CONTRATO);

  }

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <div className="flex items-center justify-between">

              <div>

                <h1 className="text-5xl font-black text-white">
                  Modelo de Contrato
                </h1>

                <p className="text-gray-400">
                  Editável — usado para gerar o PDF automaticamente ao criar um contrato
                </p>

              </div>

              <button
                onClick={() => router.back()}
                className="
                  px-5
                  py-3
                  rounded-xl
                  bg-white/10
                  hover:bg-white/20
                  text-white
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

          {carregando ? (

            <Card>
              <p className="text-gray-400 text-center py-10">
                Carregando...
              </p>
            </Card>

          ) : (

            <PageSection spacing="xxl">

              <div className="grid lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2">

                  <Card>

                    <div className="flex items-center gap-3 mb-5">

                      <FileText size={18} className="text-emerald-400" />

                      <h2 className="text-lg font-bold text-white">
                        Texto do Modelo
                      </h2>

                    </div>

                    <textarea
                      value={conteudo}
                      onChange={(e) => setConteudo(e.target.value)}
                      rows={24}
                      className="
                        w-full
                        rounded-2xl
                        border
                        border-white/10
                        bg-black/20
                        p-4
                        text-white
                        text-sm
                        font-mono
                        outline-none
                        focus:border-emerald-500
                        resize-y
                      "
                    />

                    <div className="mt-6 flex gap-4">

                      <Button onClick={salvar} disabled={salvando}>
                        {salvando ? "Salvando..." : "Salvar Modelo"}
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={restaurarPadrao}
                      >
                        Restaurar Padrão
                      </Button>

                    </div>

                  </Card>

                </div>

                <div>

                  <Card>

                    <h2 className="text-lg font-bold text-white mb-4">
                      Campos disponíveis
                    </h2>

                    <p className="text-sm text-gray-400 mb-5">
                      Use estes marcadores no texto — eles são substituídos
                      automaticamente pelos dados de cada contrato.
                    </p>

                    <div className="space-y-3">

                      {PLACEHOLDERS_CONTRATO.map((item) => (

                        <div
                          key={item.chave}
                          className="
                            rounded-xl
                            border
                            border-white/10
                            bg-white/5
                            p-3
                          "
                        >

                          <code className="text-emerald-400 text-sm">
                            {item.chave}
                          </code>

                          <p className="text-gray-400 text-xs mt-1">
                            {item.descricao}
                          </p>

                        </div>

                      ))}

                    </div>

                  </Card>

                </div>

              </div>

            </PageSection>

          )}

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
