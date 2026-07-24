"use client";

import { useEffect, useMemo, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

import SearchInput from "../components/common/SearchInput";

import InquilinoStats from "../components/inquilinos/InquilinoStats";
import InquilinoTable from "../components/inquilinos/InquilinoTable";
import InquilinoModal from "../components/inquilinos/InquilinoModal";
import InquilinoForm from "../components/inquilinos/InquilinoForm";

export default function InquilinosPage() {

  const [modalOpen, setModalOpen] = useState(false);

  const [inquilinos, setInquilinos] = useState([]);

  const [inquilinoEditando, setInquilinoEditando] =
    useState(null);

  const [carregado, setCarregado] =
    useState(false);

  const [search, setSearch] =
    useState("");

  useEffect(() => {

    const dados = JSON.parse(

      localStorage.getItem(
        "vime-inquilinos"
      ) || "[]"

    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInquilinos(dados);

    setCarregado(true);

  }, []);

  useEffect(() => {

    if (!carregado) return;

    localStorage.setItem(

      "vime-inquilinos",

      JSON.stringify(inquilinos)

    );

  }, [inquilinos, carregado]);

  const salvarInquilino = (dados) => {

    if (inquilinoEditando) {

      setInquilinos((prev) =>

        prev.map((item) =>

          item.id === inquilinoEditando.id
            ? {
                ...item,
                ...dados,
              }
            : item

        )

      );

      setInquilinoEditando(null);

      setModalOpen(false);

      return;

    }

    const novoInquilino = {

      id: Date.now(),

      ...dados,

    };

    setInquilinos((prev) => [

      ...prev,

      novoInquilino,

    ]);

    const kitnets = JSON.parse(

      localStorage.getItem(
        "vime-kitnets"
      ) || "[]"

    );

    const kitnetsAtualizadas = kitnets.map(

      (kitnet) => {

        if (

          String(kitnet.id) ===
          String(dados.kitnetId)

        ) {

          return {

            ...kitnet,

            status: "Ocupada",

            inquilinoId: novoInquilino.id,

            inquilinoNome: novoInquilino.nome,

          };

        }

        return kitnet;

      }

    );

    localStorage.setItem(

      "vime-kitnets",

      JSON.stringify(kitnetsAtualizadas)

    );

    setModalOpen(false);

  };

  const editarInquilino = (inquilino) => {

    setInquilinoEditando(inquilino);

    setModalOpen(true);

  };

  const excluirInquilino = (id) => {

    const confirmar = window.confirm(

      "Deseja realmente excluir este inquilino?"

    );

    if (!confirmar) return;

    const inquilino = inquilinos.find(

      (item) => item.id === id

    );

    if (inquilino?.kitnetId) {

      const kitnets = JSON.parse(

        localStorage.getItem(
          "vime-kitnets"
        ) || "[]"

      );

      const kitnetsAtualizadas = kitnets.map(

        (kitnet) => {

          if (

            String(kitnet.id) ===
            String(inquilino.kitnetId)

          ) {

            return {

              ...kitnet,

              status: "Disponível",

              inquilinoId: null,

              inquilinoNome: null,

            };

          }

          return kitnet;

        }

      );

      localStorage.setItem(

        "vime-kitnets",

        JSON.stringify(kitnetsAtualizadas)

      );

    }

    setInquilinos((prev) =>

      prev.filter(

        (item) => item.id !== id

      )

    );

  };

  const novoInquilino = () => {

    setInquilinoEditando(null);

    setModalOpen(true);

  };

  const inquilinosFiltrados = useMemo(() => {

    const termo = search.toLowerCase();

    return inquilinos.filter((inquilino) => (

      inquilino.nome?.toLowerCase().includes(termo) ||

      inquilino.email?.toLowerCase().includes(termo) ||

      inquilino.telefone?.toLowerCase().includes(termo) ||

      inquilino.cpf?.toLowerCase().includes(termo)

    ));

  }, [inquilinos, search]);

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <PageHeader
            title="Inquilinos"
            subtitle="Gerencie todos os inquilinos cadastrados."
            count={inquilinos.length}
            countLabel="inquilino(s) cadastrado(s)"
            actions={
              <Button onClick={novoInquilino}>
                + Novo Inquilino
              </Button>
            }
          />

          <div className="mt-8">

            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar inquilino..."
            />

          </div>

          <div className="mt-8">

            <InquilinoStats
              total={inquilinos.length}
            />

          </div>

          <div className="mt-8">

            <InquilinoTable
              inquilinos={inquilinosFiltrados}
              onDelete={excluirInquilino}
              onEdit={editarInquilino}
            />

          </div>

          <InquilinoModal
            isOpen={modalOpen}
            onClose={() => {

              setModalOpen(false);

              setInquilinoEditando(null);

            }}
          >

            <InquilinoForm
              onSave={salvarInquilino}
              inquilino={inquilinoEditando}
            />

          </InquilinoModal>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}