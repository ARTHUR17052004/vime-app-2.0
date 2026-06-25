"use client";

import { useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import ContratoResumo from "../components/contratos/ContratoResumo";
import ContratoTabs from "../components/contratos/ContratoTabs";
import ContratoFiltros from "../components/contratos/ContratoFiltros";
import ContratoDashboard from "../components/contratos/ContratoDashboard";
import ContratoProximosVencimentos from "../components/contratos/ContratoProximosVencimentos";
import ContratoRelatorios from "../components/contratos/ContratoRelatorios";
import ContratoModal from "../components/contratos/ContratoModal";
import ContratoForm from "../components/contratos/ContratoForm";
import ContratoCard from "../components/contratos/ContratoCard";

export default function ContratosPage() {

  const [modalOpen, setModalOpen] =
    useState(false);

  const [abaSelecionada, setAbaSelecionada] =
    useState("visao-geral");

  const [filtroSelecionado, setFiltroSelecionado] =
    useState("Todos");

  const [contratos, setContratos] =
    useState([]);

  const [contratoEditando, setContratoEditando] =
    useState(null);

  const [carregado, setCarregado] =
    useState(false);

  useEffect(() => {

    const dados = JSON.parse(
      localStorage.getItem(
        "vime-contratos"
      ) || "[]"
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContratos(dados);

    setCarregado(true);

  }, []);

  useEffect(() => {

    if (!carregado) return;

    localStorage.setItem(
      "vime-contratos",
      JSON.stringify(contratos)
    );

  }, [contratos, carregado]);

  const salvarContrato = (dados) => {

    if (contratoEditando) {

      const listaAtualizada =
        contratos.map((item) =>
          item.id === contratoEditando.id
            ? {
                ...item,
                ...dados,
              }
            : item
        );

      setContratos(listaAtualizada);

      setContratoEditando(null);

      setModalOpen(false);

      return;
    }

    const novoContrato = {
      id: Date.now(),
      ...dados,
    };

    setContratos((prev) => [
      ...prev,
      novoContrato,
    ]);

    const receitasAtuais = JSON.parse(
      localStorage.getItem(
        "vime-receitas"
      ) || "[]"
    );

    const novaReceita = {
      id: Date.now() + 1,

      categoria: "Aluguel",

      descricao:
        `Aluguel - ${dados.inquilinoNome}`,

      valor:
        dados.valorAluguel,

      status:
        "Pendente",

      dataRecebimento:
        "",

      dataVencimento:
        "",

      observacoes:
        "Gerado automaticamente pelo contrato",

      contratoId:
        novoContrato.id,
    };

    localStorage.setItem(
      "vime-receitas",
      JSON.stringify([
        ...receitasAtuais,
        novaReceita,
      ])
    );

    const eventos = JSON.parse(
      localStorage.getItem(
        "vime-eventos-contrato"
      ) || "[]"
    );

    eventos.push({
      id: Date.now() + 2,

      contratoId:
        novoContrato.id,

      titulo:
        "Contrato criado",

      data:
        new Date().toLocaleString(),

      cor:
        "text-green-700",
    });

    localStorage.setItem(
      "vime-eventos-contrato",
      JSON.stringify(eventos)
    );

    setModalOpen(false);
  };

  const editarContrato = (
    contrato
  ) => {

    setContratoEditando(
      contrato
    );

    setModalOpen(true);

  };

  const excluirContrato = (
    id
  ) => {

    const confirmar =
      window.confirm(
        "Deseja excluir este contrato?"
      );

    if (!confirmar)
      return;

    setContratos((prev) =>
      prev.filter(
        (contrato) =>
          contrato.id !== id
      )
    );

  };
    const encerrarContrato = (
    id
  ) => {

    const confirmar =
      window.confirm(
        "Encerrar contrato?"
      );

    if (!confirmar)
      return;

    setContratos((prev) =>
      prev.map((contrato) =>
        contrato.id === id
          ? {
              ...contrato,
              status: "ENCERRADO",
            }
          : contrato
      )
    );

    const receitas = JSON.parse(
      localStorage.getItem(
        "vime-receitas"
      ) || "[]"
    );

    const receitasAtualizadas =
      receitas.map((receita) =>
        String(receita.contratoId) ===
        String(id)
          ? {
              ...receita,
              status: "Cancelado",
            }
          : receita
      );

    localStorage.setItem(
      "vime-receitas",
      JSON.stringify(
        receitasAtualizadas
      )
    );

    const eventos = JSON.parse(
      localStorage.getItem(
        "vime-eventos-contrato"
      ) || "[]"
    );

    eventos.push({
      id: Date.now(),
      contratoId: id,
      titulo: "Contrato encerrado",
      data: new Date().toLocaleString(),
      cor: "text-gray-700",
    });

    localStorage.setItem(
      "vime-eventos-contrato",
      JSON.stringify(eventos)
    );

  };

  const renovarContrato = (
    id
  ) => {

    let contratoRenovado =
      null;

    setContratos((prev) =>
      prev.map((contrato) => {

        if (
          contrato.id === id
        ) {

          contratoRenovado = {
            ...contrato,
            status: "ATIVO",
          };

          return contratoRenovado;
        }

        return contrato;

      })
    );

    if (!contratoRenovado)
      return;

    const receitas = JSON.parse(
      localStorage.getItem(
        "vime-receitas"
      ) || "[]"
    );

    const novaReceita = {

      id: Date.now(),

      contratoId:
        contratoRenovado.id,

      categoria:
        "Aluguel",

      descricao:
        `Aluguel - ${contratoRenovado.inquilinoNome}`,

      valor:
        contratoRenovado.valorAluguel,

      status:
        "Pendente",

      dataRecebimento:
        "",

      dataVencimento:
        "",

      observacoes:
        "Gerado pela renovação do contrato",

    };

    localStorage.setItem(
      "vime-receitas",
      JSON.stringify([
        ...receitas,
        novaReceita,
      ])
    );

    const eventos = JSON.parse(
      localStorage.getItem(
        "vime-eventos-contrato"
      ) || "[]"
    );

    eventos.push({
      id: Date.now() + 1,
      contratoId:
        contratoRenovado.id,
      titulo:
        "Contrato renovado",
      data:
        new Date().toLocaleString(),
      cor:
        "text-blue-700",
    });

    localStorage.setItem(
      "vime-eventos-contrato",
      JSON.stringify(eventos)
    );

  };

  const marcarInadimplente = (
    id
  ) => {

    setContratos((prev) =>
      prev.map((contrato) =>
        contrato.id === id
          ? {
              ...contrato,
              status:
                "INADIMPLENTE",
            }
          : contrato
      )
    );

    const receitas = JSON.parse(
      localStorage.getItem(
        "vime-receitas"
      ) || "[]"
    );

    const receitasAtualizadas =
      receitas.map((receita) =>
        String(receita.contratoId) ===
        String(id)
          ? {
              ...receita,
              status:
                "Atrasado",
            }
          : receita
      );

    localStorage.setItem(
      "vime-receitas",
      JSON.stringify(
        receitasAtualizadas
      )
    );

    const eventos = JSON.parse(
      localStorage.getItem(
        "vime-eventos-contrato"
      ) || "[]"
    );

    eventos.push({
      id: Date.now() + 2,
      contratoId: id,
      titulo:
        "Contrato marcado como inadimplente",
      data:
        new Date().toLocaleString(),
      cor:
        "text-red-700",
    });

    localStorage.setItem(
      "vime-eventos-contrato",
      JSON.stringify(eventos)
    );

  };

  const novoContrato = () => {

    setContratoEditando(
      null
    );

    setModalOpen(true);

  };
    const contratosFiltrados =
    contratos.filter(
      (contrato) => {

        if (
          filtroSelecionado !==
            "Todos" &&
          contrato.status !==
            filtroSelecionado.toUpperCase()
        ) {
          return false;
        }

        if (
          abaSelecionada ===
          "ativos"
        ) {
          return contrato.status === "ATIVO";
        }

        if (
          abaSelecionada ===
          "pendentes"
        ) {
          return contrato.status === "PENDENTE";
        }

        if (
          abaSelecionada ===
          "inadimplentes"
        ) {
          return contrato.status === "INADIMPLENTE";
        }

        if (
          abaSelecionada ===
          "encerrados"
        ) {
          return contrato.status === "ENCERRADO";
        }

        return true;

      }
    );

  return (
    <MainLayout>

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-4xl font-bold text-gray-800">
            Contratos
          </h1>

          <p className="text-gray-500 mt-2">
            Gestão de contratos
          </p>

          <p className="text-sm text-green-600 mt-1">
            {contratos.length} contrato(s)
            cadastrado(s)
          </p>

        </div>

        <button
          onClick={novoContrato}
          className="
            bg-green-700
            text-white
            px-6
            py-3
            rounded-lg
            hover:bg-green-800
          "
        >
          + Novo Contrato
        </button>

      </div>

      <ContratoResumo
        contratos={contratos}
      />

      <ContratoFiltros
        filtroSelecionado={
          filtroSelecionado
        }
        setFiltroSelecionado={
          setFiltroSelecionado
        }
      />

      <ContratoTabs
        abaSelecionada={
          abaSelecionada
        }
        setAbaSelecionada={
          setAbaSelecionada
        }
      />

      {abaSelecionada ===
        "visao-geral" && (

        <div className="space-y-8">

          <ContratoDashboard
            contratos={contratos}
          />

          <ContratoCard
            contratos={contratosFiltrados}
            onEdit={editarContrato}
            onDelete={excluirContrato}
            onEncerrar={encerrarContrato}
            onRenovar={renovarContrato}
            onMarcarInadimplente={
              marcarInadimplente
            }
          />

          <ContratoProximosVencimentos
            contratos={contratos}
          />

          <ContratoRelatorios />

        </div>

      )}

      {[
        "ativos",
        "pendentes",
        "inadimplentes",
        "encerrados",
      ].includes(
        abaSelecionada
      ) && (

        <ContratoCard
          contratos={contratosFiltrados}
          onEdit={editarContrato}
          onDelete={excluirContrato}
          onEncerrar={encerrarContrato}
          onRenovar={renovarContrato}
          onMarcarInadimplente={
            marcarInadimplente
          }
        />

      )}

      <ContratoModal
        isOpen={modalOpen}
        onClose={() => {

          setModalOpen(false);

          setContratoEditando(
            null
          );

        }}
      >

        <ContratoForm
          onSave={salvarContrato}
          contratoEditando={
            contratoEditando
          }
        />

      </ContratoModal>

    </MainLayout>
  );

}