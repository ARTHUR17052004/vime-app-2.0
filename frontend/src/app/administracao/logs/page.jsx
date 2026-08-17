"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";
import Table from "../../components/ui/Table";
import SearchInput from "../../components/ui/SearchInput";

import { LogService } from "@/services/log.service";

export default function LogsPage() {

  const router = useRouter();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");

  const carregarLogs = useCallback(async () => {

    try {

      setLoading(true);

      const resposta = await LogService.listar();

      const lista = Array.isArray(resposta)
        ? resposta
        : resposta.data || [];

      setLogs(lista);

    } catch (err) {

      console.error(err);

      setErro(
        err.message ||
        "Erro ao carregar logs."
      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    carregarLogs();

  }, [carregarLogs]);

  const logsFiltrados = useMemo(() => {

    if (!busca.trim()) return logs;

    const texto = busca.toLowerCase();

    return logs.filter((log) =>
      log.usuarioNome?.toLowerCase().includes(texto) ||
      log.modulo?.toLowerCase().includes(texto) ||
      log.acao?.toLowerCase().includes(texto) ||
      log.descricao?.toLowerCase().includes(texto)
    );

  }, [logs, busca]);

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
    },
    {
      key: "descricao",
      title: "Descrição",
      render: (item) => item.descricao || "-",
    },
    {
      key: "ip",
      title: "IP",
      render: (item) => item.ip || "-",
    },
  ];

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <div className="flex items-center justify-between">

              <div>

                <h1 className="text-5xl font-black text-[var(--text)]">
                  Logs do Sistema
                </h1>

                <p className="text-[var(--text-subtle)]">
                  Registro de eventos e atividades
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

          <PageSection spacing="lg">

            <SearchInput
              placeholder="Pesquisar por usuário, módulo, ação ou descrição..."
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
              data={logsFiltrados}
              loading={loading}
              emptyMessage="Nenhum log encontrado."
            />

          </PageSection>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
