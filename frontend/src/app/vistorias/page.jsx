/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import VistoriaResumo from "../components/vistorias/VistoriaResumo";
import OcorrenciaCard from "../components/vistorias/OcorrenciaCard";
import VistoriaTabs from "../components/vistorias/VistoriaTabs";
import VistoriaFiltros from "../components/vistorias/VistoriaFiltros";
import VistoriaProximasVistorias from "../components/vistorias/VistoriaProximasVistorias";
import VistoriaRelatorios from "../components/vistorias/VistoriaRelatorios";
import VistoriaModal from "../components/vistorias/VistoriaModal";
import VistoriaForm from "../components/vistorias/VistoriaForm";
import VistoriaCard from "../components/vistorias/VistoriaCard";
export default function VistoriasPage() {

  const [modalOpen, setModalOpen] =
    useState(false);

  const [abaSelecionada, setAbaSelecionada] =
    useState("visao-geral");

  const [filtroSelecionado, setFiltroSelecionado] =
    useState("Todos");

  const [vistorias, setVistorias] =
    useState([]);

  const [vistoriaEditando, setVistoriaEditando] =
    useState(null);

  const [carregado, setCarregado] =
    useState(false);

  useEffect(() => {

  const dados = JSON.parse(
    localStorage.getItem(
      "vime-vistorias"
    ) || "[]"
  );

  const hoje =
    new Date()
      .toISOString()
      .split("T")[0];

  const atualizadas =
    dados.map((vistoria) => {

      if (
        vistoria.status ===
          "PROGRAMADA" &&
        vistoria.dataProxima &&
        vistoria.dataProxima < hoje
      ) {

        return {
          ...vistoria,
          status:
            "ATRASADA",
        };

      }

      return vistoria;

    });

  setVistorias(
    atualizadas
  );

  setCarregado(true);

}, []);

  useEffect(() => {

    if (!carregado) return;

    localStorage.setItem(
      "vime-vistorias",
      JSON.stringify(vistorias)
    );

  }, [vistorias, carregado]);

 const salvarVistoria = (
  dados
) => {

  const agora =
    new Date().toLocaleString(
      "pt-BR"
    );

  if (vistoriaEditando) {

    const listaAtualizada =
      vistorias.map((item) => {

        if (
          item.id !==
          vistoriaEditando.id
        ) {
          return item;
        }

        return {

          ...item,

          ...dados,

          historico: [

            ...(item.historico || []),

            {
              data: agora,
              descricao:
                "Vistoria editada",
            },

          ],

        };

      });

    setVistorias(
      listaAtualizada
    );

    setVistoriaEditando(
      null
    );

    setModalOpen(false);

    return;

  }

  const novaVistoria = {

    id: Date.now(),

    ...dados,

    historico: [

      {
        data: agora,
        descricao:
          "Vistoria criada",
      },

    ],

  };

  setVistorias((prev) => [

    ...prev,

    novaVistoria,

  ]);

  setModalOpen(false);

};

  const editarVistoria = (
    vistoria
  ) => {

    setVistoriaEditando(
      vistoria
    );

    setModalOpen(true);

  };

  const excluirVistoria = (
    id
  ) => {

    const confirmar =
      window.confirm(
        "Deseja excluir esta vistoria?"
      );

    if (!confirmar) return;

    setVistorias((prev) =>
      prev.filter(
        (vistoria) =>
          vistoria.id !== id
      )
    );

  };

const concluirVistoria = (
  id
) => {

  setVistorias((prev) =>
    prev.map((vistoria) => {

      if (
        vistoria.id !== id
      ) {
        return vistoria;
      }

      const hoje =
        new Date();

      const proximaData =
        new Date(hoje);

      switch (
        vistoria.periodicidade
      ) {

        case "Semanal":
          proximaData.setDate(
            proximaData.getDate() + 7
          );
          break;

        case "Quinzenal":
          proximaData.setDate(
            proximaData.getDate() + 15
          );
          break;

        case "Mensal":
          proximaData.setMonth(
            proximaData.getMonth() + 1
          );
          break;

        case "Bimestral":
          proximaData.setMonth(
            proximaData.getMonth() + 2
          );
          break;

        case "Trimestral":
          proximaData.setMonth(
            proximaData.getMonth() + 3
          );
          break;

        case "Semestral":
          proximaData.setMonth(
            proximaData.getMonth() + 6
          );
          break;

        case "Anual":
          proximaData.setFullYear(
            proximaData.getFullYear() + 1
          );
          break;

        default:
          break;

      }

      const hojeFormatado =
        hoje
          .toISOString()
          .split("T")[0];

      const proximaFormatada =
        proximaData
          .toISOString()
          .split("T")[0];

      const agora =
        new Date()
          .toLocaleString(
            "pt-BR"
          );

      return {

        ...vistoria,

        status:
          "PROGRAMADA",

        dataUltima:
          hojeFormatado,

        dataProxima:
          proximaFormatada,

        historico: [

          ...(vistoria.historico || []),

          {
            data: agora,
            descricao:
              "Vistoria realizada",
          },

          {
            data: agora,
            descricao:
              `Próxima execução programada para ${proximaFormatada}`,
          },

        ],

      };

    })
  );

};

  const cancelarVistoria = (
  id
) => {

  setVistorias((prev) =>
    prev.map((vistoria) => {

      if (
        vistoria.id !== id
      ) {
        return vistoria;
      }

      const agora =
        new Date()
          .toLocaleString(
            "pt-BR"
          );

      return {

        ...vistoria,

        status:
          "CANCELADA",

        historico: [

          ...(vistoria.historico || []),

          {
            data: agora,
            descricao:
              "Vistoria cancelada",
          },

        ],

      };

    })
  );

};

  const novaVistoria = () => {

    setVistoriaEditando(
      null
    );

    setModalOpen(true);

  };
   const vistoriasFiltradas =
  vistorias.filter(
    (vistoria) => {

      if (
        filtroSelecionado !==
          "Todos" &&
        vistoria.categoria !==
          filtroSelecionado
      ) {
        return false;
      }

      if (
        abaSelecionada ===
        "agendadas"
      ) {
        return (
          vistoria.status ===
          "PROGRAMADA"
        );
      }

      if (
        abaSelecionada ===
        "realizadas"
      ) {
        return (
          vistoria.status ===
          "REALIZADA"
        );
      }

      if (
        abaSelecionada ===
        "pendentes"
      ) {
        return (
          vistoria.status ===
          "PENDENTE"
        );
      }

      return true;

    }
  );

return (
  <MainLayout>

    <div className="flex items-center justify-between mb-8">

      <div>

        <h1 className="text-4xl font-bold text-gray-900">
          Vistorias
        </h1>

        <p className="text-gray-700 mt-2">
          Gestão de vistorias
        </p>

        <p className="text-sm text-green-700 mt-1">
          {vistorias.length} vistoria(s) cadastrada(s)
        </p>

      </div>

      <button
        onClick={novaVistoria}
        className="
          bg-green-700
          text-white
          px-6
          py-3
          rounded-2xl
          hover:bg-green-800
        "
      >
        + Nova Vistoria
      </button>

    </div>

    <VistoriaResumo
      vistorias={vistorias}
    />

    <VistoriaFiltros
      filtroSelecionado={filtroSelecionado}
      setFiltroSelecionado={setFiltroSelecionado}
    />

    <VistoriaTabs
      abaSelecionada={abaSelecionada}
      setAbaSelecionada={setAbaSelecionada}
    />

    {
      abaSelecionada ===
      "ocorrencias" ? (

        <OcorrenciaCard />

      ) : (

        <div className="space-y-8">

          <VistoriaCard
            vistorias={vistoriasFiltradas}
            onEdit={editarVistoria}
            onDelete={excluirVistoria}
            onConcluir={concluirVistoria}
            onCancelar={cancelarVistoria}
          />

          <VistoriaProximasVistorias
            vistorias={vistorias}
          />

          <VistoriaRelatorios
            vistorias={vistorias}
          />

        </div>

      )
    }

    <VistoriaModal
      isOpen={modalOpen}
      onClose={() => {

        setModalOpen(false);

        setVistoriaEditando(
          null
        );

      }}
    >

      <VistoriaForm
        onSave={salvarVistoria}
        vistoriaEditando={
          vistoriaEditando
        }
      />

    </VistoriaModal>

  </MainLayout>
)}