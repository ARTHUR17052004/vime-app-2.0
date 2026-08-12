"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import SearchInput from "../../components/ui/SearchInput";
import Modal from "../../components/ui/Modal";

import { AuditoriaService } from "@/services/auditoria.service";

const ACAO_VARIANT = {
  CRIAR: "emerald",
  CREATE: "emerald",
  ATUALIZAR: "blue",
  UPDATE: "blue",
  EXCLUIR: "red",
  DELETE: "red",
};

export default function AuditoriaPage() {

  const router = useRouter();

  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [detalhe, setDetalhe] = useState(null);

  const carregarRegistros = useCallback(async () => {

    try {

      setLoading(true);

      const resposta = await AuditoriaService.listar();

      const lista = Array.isArray(resposta)
        ? resposta
        : resposta.data || [];

      setRegistros(lista);

    } catch (err) {

      console.error(err);

      setErro(
        err.message ||
        "Erro ao carregar auditoria."
      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    carregarRegistros();

  }, [carregarRegistros]);

  const registrosFiltrados = useMemo(() => {

    if (!busca.trim()) return registros;

    const texto = busca.toLowerCase();

    return registros.filter((registro) =>
      registro.usuarioNome?.toLowerCase().includes(texto) ||
      registro.modulo?.toLowerCase().includes(texto) ||
      registro.acao?.toLowerCase().includes(texto)
    );

  }, [registros, busca]);

  const columns = [
    {
      key: "createdAt",
      title: "Data",
      render: (item) =>
        new Date(item.createdAt).toLocaleString("pt-BR"),
    },
    {
      key: "usuarioNome",
      title: "Usuário",
      render: (item) => item.usuarioNome || "Sistema",
    },
    {
      key: "modulo",
      title: "Módulo",
    },
    {
      key: "acao",
      title: "Ação",
      render: (item) => (
        <Badge variant={ACAO_VARIANT[item.acao] || "gray"}>
          {item.acao}
        </Badge>
      ),
    },
    {
      key: "ip",
      title: "IP",
      render: (item) => item.ip || "-",
    },
    {
      key: "detalhes",
      title: "Detalhes",
      render: (item) => (
        <button
          onClick={() => setDetalhe(item)}
          className="
            flex
            items-center
            gap-2
            text-emerald-400
            hover:text-emerald-300
          "
        >
          <Eye size={16} />
          Ver
        </button>
      ),
    },
  ];

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <div className="flex items-center justify-between">

              <div>

                <h1 className="text-5xl font-black text-white">
                  Auditoria
                </h1>

                <p className="text-gray-400">
                  Histórico de alterações no sistema
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

          <PageSection spacing="lg">

            <SearchInput
              placeholder="Pesquisar por usuário, módulo ou ação..."
              value={busca}
              onChange={setBusca}
            />

          </PageSection>

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

            <Table
              columns={columns}
              data={registrosFiltrados}
              loading={loading}
              emptyMessage="Nenhum registro de auditoria encontrado."
            />

          </PageSection>

          <Modal
            open={!!detalhe}
            onClose={() => setDetalhe(null)}
            title="Detalhes do Registro"
            subtitle={detalhe ? `${detalhe.modulo} · ${detalhe.acao}` : ""}
            size="md"
          >

            {detalhe && (

              <div className="space-y-6">

                <div>

                  <p className="text-sm text-gray-400 mb-2">
                    Valor Anterior
                  </p>

                  <pre
                    className="
                      rounded-xl
                      bg-black/30
                      p-4
                      text-xs
                      text-gray-300
                      overflow-x-auto
                      whitespace-pre-wrap
                    "
                  >
                    {detalhe.valorAnterior
                      ? JSON.stringify(detalhe.valorAnterior, null, 2)
                      : "-"}
                  </pre>

                </div>

                <div>

                  <p className="text-sm text-gray-400 mb-2">
                    Valor Novo
                  </p>

                  <pre
                    className="
                      rounded-xl
                      bg-black/30
                      p-4
                      text-xs
                      text-gray-300
                      overflow-x-auto
                      whitespace-pre-wrap
                    "
                  >
                    {detalhe.valorNovo
                      ? JSON.stringify(detalhe.valorNovo, null, 2)
                      : "-"}
                  </pre>

                </div>

              </div>

            )}

          </Modal>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
