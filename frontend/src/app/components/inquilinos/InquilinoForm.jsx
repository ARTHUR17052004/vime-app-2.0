"use client";

import { useEffect, useState } from "react";

import { KitnetService } from "../../../services/kitnets.service";
import { CamposObrigatoriosService } from "../../../services/camposObrigatorios.service";
import { obterCamposFaltando, mensagemCamposFaltando } from "../../../utils/validacaoObrigatorios";

import DadosPessoaisStep from "./steps/DadosPessoaisStep";
import KitnetStep from "./steps/KitnetStep";
import ContratoStep from "./steps/ContratoStep";

// Campos que aparecem em cada etapa -- usado pra validar só o que já
// está visível quando o usuário clica em "Continuar", em vez de deixar
// pra descobrir campo faltando só no fim (etapa 3).
const CAMPOS_POR_STEP = {
  1: ["nome", "email", "telefone", "cpf", "dataNascimento", "enderecoAnterior", "contatoEmergencia", "telefoneEmergencia"],
  2: ["kitnetId"],
  3: ["dataInicioContrato", "dataFimContrato", "tipoGarantia", "valorCaucao"],
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
  dataNascimento: "Data de Nascimento",
  enderecoAnterior: "Endereço Anterior",
  contatoEmergencia: "Contato de Emergência",
  telefoneEmergencia: "Telefone de Emergência",
  kitnetId: "Kitnet",
  dataInicioContrato: "Início do Contrato",
  dataFimContrato: "Fim do Contrato",
  prazoContrato: "Prazo do Contrato",
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
    dataNascimento: "",
    enderecoAnterior: "",
    contatoEmergencia: "",
    telefoneEmergencia: "",

    kitnetId: "",

    dataInicioContrato: "",
    dataFimContrato: "",
    // Prazo padrão do contrato -- fixo em 4 meses (mesmo período usado
    // pra sugerir automaticamente a Data Final acima).
    prazoContrato: "4",
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

        const [respInquilino, respContrato] = await Promise.all([
          CamposObrigatoriosService.listar("inquilino"),
          CamposObrigatoriosService.listar("contrato"),
        ]);

        const listaInquilino = Array.isArray(respInquilino) ? respInquilino : respInquilino.data || [];
        const listaContrato = Array.isArray(respContrato) ? respContrato : respContrato.data || [];

        const exigidos = new Set(
          listaInquilino.filter((c) => c.obrigatorio).map((c) => c.campo)
        );

        // O contrato é gerado automaticamente a partir destes dados -- se
        // "Contratos" exige um campo (ex.: Data Final), a etapa 3 daqui
        // também passa a exigir, senão o contrato sai incompleto sem o
        // usuário nem saber. Índice de Reajuste fica de fora: não existe
        // mais campo pra ele aqui (removido da etapa 3), então não dá
        // pra exigir -- quem precisar define depois editando o contrato.
        const MAPA_CONTRATO_PARA_INQUILINO = { dataFim: "dataFimContrato" };
        const CAMPOS_CONTRATO_FORA_DO_INQUILINO = new Set(["indiceReajuste"]);

        listaContrato
          .filter((c) => c.obrigatorio && !CAMPOS_CONTRATO_FORA_DO_INQUILINO.has(c.campo))
          .forEach((c) => exigidos.add(MAPA_CONTRATO_PARA_INQUILINO[c.campo] || c.campo));

        setObrigatorios(exigidos);

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
        inquilino.prazoContrato || "4",

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

    const exigidos = new Set([...obrigatorios, ...SEMPRE_OBRIGATORIOS]);

    const faltando = obterCamposFaltando(campos, formData, exigidos, ROTULOS);

    if (faltando.length > 0) {
      setErroStep(mensagemCamposFaltando(faltando));
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

    // Um <input> de texto sozinho na etapa 2 (busca da kitnet) permite
    // que o Enter dispare submissão implícita do form mesmo sem clicar
    // em "Salvar Inquilino" -- isso não pode salvar com dados de uma
    // etapa que o usuário nem viu ainda. Só a etapa 3 pode submeter de
    // verdade.
    if (step !== 3) return;

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
      noValidate
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