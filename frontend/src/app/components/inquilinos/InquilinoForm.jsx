"use client";

import { useEffect, useState } from "react";

import { KitnetService } from "../../../services/kitnets.service";
import { CamposObrigatoriosService } from "../../../services/camposObrigatorios.service";

import DadosPessoaisStep from "./steps/DadosPessoaisStep";
import KitnetStep from "./steps/KitnetStep";
import ContratoStep from "./steps/ContratoStep";

// Campos que aparecem em cada etapa -- usado pra validar só o que já
// está visível quando o usuário clica em "Continuar", em vez de deixar
// pra descobrir campo faltando só no fim (etapa 3).
const CAMPOS_POR_STEP = {
  1: ["nome", "email", "telefone", "cpf", "rg", "dataNascimento", "enderecoAnterior", "contatoEmergencia", "telefoneEmergencia"],
  2: ["kitnetId"],
  3: ["dataInicioContrato", "dataFimContrato", "prazoContrato", "indiceReajuste", "tipoGarantia", "valorCaucao"],
};

// Estruturalmente necessários pro cadastro/contrato automático
// funcionarem, independente do que o admin configurar em Campos
// Obrigatórios.
const SEMPRE_OBRIGATORIOS = new Set(["nome", "email", "telefone", "kitnetId", "dataInicioContrato"]);

const ROTULOS = {
  nome: "Nome Completo",
  email: "E-mail",
  telefone: "Telefone",
  cpf: "CPF",
  rg: "RG",
  dataNascimento: "Data de Nascimento",
  enderecoAnterior: "Endereço Anterior",
  contatoEmergencia: "Contato de Emergência",
  telefoneEmergencia: "Telefone de Emergência",
  kitnetId: "Kitnet",
  dataInicioContrato: "Início do Contrato",
  dataFimContrato: "Fim do Contrato",
  prazoContrato: "Prazo do Contrato",
  indiceReajuste: "Índice de Reajuste",
  tipoGarantia: "Tipo de Garantia",
  valorCaucao: "Valor da Caução",
};

export default function InquilinoForm({
  onSave,
  inquilino,
  salvando = false,
}) {

  const [step, setStep] = useState(1);

  const [kitnets, setKitnets] = useState([]);

  const [obrigatorios, setObrigatorios] = useState(new Set());

  const [erroStep, setErroStep] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    enderecoAnterior: "",
    contatoEmergencia: "",
    telefoneEmergencia: "",

    kitnetId: "",

    dataInicioContrato: "",
    dataFimContrato: "",
    prazoContrato: "",
    indiceReajuste: "",
    tipoGarantia: "",
    valorCaucao: "",

    ativo: true,
  });

  useEffect(() => {

    async function carregarKitnets() {

      try {

        const resposta =
          await KitnetService.listar();

        const lista = Array.isArray(resposta)

          ? resposta

          : resposta.data || [];

        setKitnets(lista);

      } catch (err) {

        console.error(err);

      }

    }

    async function carregarObrigatorios() {

      try {

        const resposta = await CamposObrigatoriosService.listar("inquilino");

        const lista = Array.isArray(resposta) ? resposta : resposta.data || [];

        setObrigatorios(
          new Set(lista.filter((c) => c.obrigatorio).map((c) => c.campo))
        );

      } catch (err) {

        console.error(err);

      }

    }

    carregarKitnets();
    carregarObrigatorios();

  }, []);

  useEffect(() => {

    if (!inquilino) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({

      nome: inquilino.nome || "",
      email: inquilino.email || "",
      telefone: inquilino.telefone || "",
      cpf: inquilino.cpf || "",
      rg: inquilino.rg || "",
      dataNascimento:
        inquilino.dataNascimento || "",
      enderecoAnterior:
        inquilino.enderecoAnterior || "",
      contatoEmergencia:
        inquilino.contatoEmergencia || "",
      telefoneEmergencia:
        inquilino.telefoneEmergencia || "",

      kitnetId:
        inquilino.kitnetId || "",

      dataInicioContrato:
        inquilino.dataInicioContrato || "",

      dataFimContrato:
        inquilino.dataFimContrato || "",

      prazoContrato:
        inquilino.prazoContrato || "",

      indiceReajuste:
        inquilino.indiceReajuste || "",

      tipoGarantia:
        inquilino.tipoGarantia || "",

      valorCaucao:
        inquilino.valorCaucao || "",

      ativo:
        inquilino.ativo ?? true,

    });

  }, [inquilino]);

  function handleChange(e) {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setErroStep("");

    setFormData((prev) => {

      const novo = {
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      };

      // Data final sugerida automaticamente (4 meses após o início),
      // só quando o campo ainda estiver vazio -- não sobrescreve se o
      // usuário já escolheu uma data própria.
      if (name === "dataInicioContrato" && value && !prev.dataFimContrato) {

        const data = new Date(value);
        data.setMonth(data.getMonth() + 4);
        novo.dataFimContrato = data.toISOString().slice(0, 10);

      }

      return novo;

    });

  }

  function validarStep(numero) {

    const campos = CAMPOS_POR_STEP[numero] || [];

    const faltando = campos.filter((campo) => {

      const exigido = SEMPRE_OBRIGATORIOS.has(campo) || obrigatorios.has(campo);

      if (!exigido) return false;

      const valor = formData[campo];

      return valor === undefined || valor === null || valor === "";

    });

    if (faltando.length > 0) {

      setErroStep(
        `Preencha os campos obrigatórios: ${faltando.map((c) => ROTULOS[c] || c).join(", ")}.`
      );

      return false;

    }

    setErroStep("");

    return true;

  }

  function proximoStep() {

    if (!validarStep(step)) return;

    setStep((prev) => prev + 1);

  }

  function voltarStep() {

    setErroStep("");

    setStep((prev) => prev - 1);

  }

  function handleSubmit(e) {

    e.preventDefault();

    if (salvando) return;

    if (!validarStep(3)) return;

    const kitnetSelecionada =
      kitnets.find(

        (item) =>

          String(item.id) ===
          String(formData.kitnetId)

      );

    onSave({

      ...formData,

      kitnetNome:
        kitnetSelecionada
          ? `APT ${kitnetSelecionada.numero}`
          : "",

      unidadeNome:
        kitnetSelecionada?.unidade?.nome ||
        kitnetSelecionada?.unidadeNome ||
        "",

    });

  }

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >

      <div className="flex items-center justify-center gap-4">

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-[var(--text)] font-semibold ${
            step >= 1
              ? "bg-emerald-600"
              : "bg-[var(--surface-3)]"
          }`}
        >
          1
        </div>

        <div className="w-16 h-1 bg-[var(--surface-3)]" />

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-[var(--text)] font-semibold ${
            step >= 2
              ? "bg-emerald-600"
              : "bg-[var(--surface-3)]"
          }`}
        >
          2
        </div>

        <div className="w-16 h-1 bg-[var(--surface-3)]" />

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-[var(--text)] font-semibold ${
            step >= 3
              ? "bg-emerald-600"
              : "bg-[var(--surface-3)]"
          }`}
        >
          3
        </div>

      </div>

      {step === 1 && (

        <DadosPessoaisStep
          formData={formData}
          handleChange={handleChange}
          obrigatorios={obrigatorios}
        />

      )}

      {step === 2 && (

        <KitnetStep
          formData={formData}
          handleChange={handleChange}
          kitnets={kitnets}
        />

      )}

      {step === 3 && (

        <ContratoStep
          formData={formData}
          handleChange={handleChange}
          obrigatorios={obrigatorios}
        />

      )}

      {erroStep && (

        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
          {erroStep}
        </div>

      )}

      <div className="flex justify-between">

        {step > 1 ? (

          <button
            type="button"
            onClick={voltarStep}
            className="px-6 py-3 rounded-lg border border-[var(--border-token)] text-[var(--text)] hover:bg-[var(--surface-2)] transition-all"
          >
            Voltar
          </button>

        ) : (

          <div />

        )}

        {step < 3 ? (

          <button
            type="button"
            onClick={proximoStep}
            className="bg-emerald-600 hover:bg-emerald-700 text-[var(--text)] px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Continuar
          </button>

        ) : (

          <button
            type="submit"
            disabled={salvando}
            className="bg-emerald-600 hover:bg-emerald-700 text-[var(--text)] px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {salvando
              ? "Salvando..."
              : inquilino
                ? "Salvar Alterações"
                : "Salvar Inquilino"}
          </button>

        )}

      </div>

    </form>

  );

}