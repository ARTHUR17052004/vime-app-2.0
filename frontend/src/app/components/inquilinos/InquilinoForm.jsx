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
  1: ["nome", "email", "telefone", "cpf", "dataNascimento", "sexo", "contatoEmergencia", "telefoneEmergencia"],
  2: ["kitnetId"],
  3: ["dataInicioContrato", "dataFimContrato"],
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
  sexo: "Sexo",
  contatoEmergencia: "Contato de Emergência",
  telefoneEmergencia: "Telefone de Emergência",
  kitnetId: "Kitnet",
  dataInicioContrato: "Início do Contrato",
  dataFimContrato: "Fim do Contrato",
  prazoContrato: "Prazo do Contrato",
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
    sexo: "",
    contatoEmergencia: "",
    telefoneEmergencia: "",

    kitnetId: "",

    dataInicioContrato: "",
    dataFimContrato: "",
    // Prazo padrão do contrato -- fixo em 4 meses (mesmo período usado
    // pra sugerir automaticamente a Data Final acima).
    prazoContrato: "4",

    // Dedução mensal (água + energia) -- opcional, usada só no
    // Relatório de Receitas (Financeiro > Extratos). Em branco, o
    // relatório usa o padrão do locador (Locador.taxaAdministracao).
    valorDeducao: "",

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
        // usuário nem saber. Índice de Reajuste, Tipo de Garantia e Valor
        // da Caução ficam de fora: não existe mais campo pra eles aqui
        // (removidos da etapa 3), então não dá pra exigir -- quem
        // precisar define depois editando o contrato.
        const MAPA_CONTRATO_PARA_INQUILINO = { dataFim: "dataFimContrato" };
        const CAMPOS_CONTRATO_FORA_DO_INQUILINO = new Set([
          "indiceReajuste", "tipoGarantia", "valorCaucao",
        ]);

        listaContrato
          .filter((c) => c.obrigatorio && !CAMPOS_CONTRATO_FORA_DO_INQUILINO.has(c.campo))
          .forEach((c) => exigidos.add(MAPA_CONTRATO_PARA_INQUILINO[c.campo] || c.campo));

        // Podem existir configurações antigas de "Campos Obrigatórios"
        // marcando esses dois como obrigatórios em Inquilinos -- como o
        // campo não existe mais nesta tela, nunca trava por causa dele.
        exigidos.delete("tipoGarantia");
        exigidos.delete("valorCaucao");

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
      // <input type="date"> só aceita o valor no formato exato
      // "aaaa-mm-dd" -- a API devolve data/hora completa (ISO), e sem
      // cortar pros 10 primeiros caracteres o campo simplesmente
      // aparecia em branco, mesmo com a data salva corretamente.
      dataNascimento:
        (inquilino.dataNascimento || "").slice(0, 10),
      sexo:
        inquilino.sexo || "",
      contatoEmergencia:
        inquilino.contatoEmergencia || "",
      telefoneEmergencia:
        inquilino.telefoneEmergencia || "",

      kitnetId:
        inquilino.kitnetId || "",

      dataInicioContrato:
        (inquilino.dataInicioContrato || "").slice(0, 10),

      dataFimContrato:
        (inquilino.dataFimContrato || "").slice(0, 10),

      prazoContrato:
        inquilino.prazoContrato || "4",

      valorDeducao:
        inquilino.valorDeducao ?? "",

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

      // Data final sugerida automaticamente (prazo em meses após o
      // início), só quando o campo ainda estiver vazio -- não
      // sobrescreve se o usuário já escolheu uma data própria.
      //
      // O input de data dispara onChange a cada dígito digitado --
      // enquanto o ano está pela metade (ex.: "0002" no meio de
      // "2025"), value já é uma data "válida" só que com ano errado.
      // Sem essa checagem, essa data quebrada era gravada e, como o
      // campo deixa de estar vazio, nunca mais era recalculada.
      const anoCompleto = /^\d{4}-\d{2}-\d{2}$/.test(value) && Number(value.slice(0, 4)) >= 1900;

      if (name === "dataInicioContrato" && anoCompleto && !prev.dataFimContrato) {

        const data = new Date(value);
        const meses = Number(prev.prazoContrato) || 4;
        data.setMonth(data.getMonth() + meses);
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

  // O form nunca submete de verdade (ver handleSubmit/avancarOuSalvar
  // abaixo) -- isso é só uma rede de segurança caso algum navegador
  // dispare "submit" mesmo assim (ex.: Enter em algum campo que escapou
  // do bloquearEnvioPorEnter).
  function handleSubmit(e) {
    e.preventDefault();
  }

  // Botão único (Continuar/Salvar) SEMPRE type="button" -- nunca troca
  // pra type="submit" dependendo da etapa. Bug real encontrado em
  // 24/11/2026: quando esse botão trocava de type="button" (Continuar,
  // etapa 2) pra type="submit" (Salvar, etapa 3) na MESMA posição, o
  // clique que levava o usuário pra etapa 3 podia disparar a submissão
  // nativa do form -- o navegador decide se o clique ativa um submit
  // olhando o type do elemento DEPOIS do React re-renderizar em reação
  // ao onClick, não antes. Na EDIÇÃO isso fechava o modal na hora (sem
  // dar tempo de ver a etapa 3) porque Início/Fim do Contrato já vêm
  // preenchidos, então validarStep(3) passava liso -- ao CRIAR um
  // inquilino novo esses campos estão vazios, então a mesma falha só
  // mostraria um erro de campo faltando, nunca fechava, e por isso
  // passou despercebido até alguém editar um inquilino já existente.
  function avancarOuSalvar() {

    if (step < 3) {
      proximoStep();
      return;
    }

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

  // Nenhuma etapa tem botão type="submit" (ver avancarOuSalvar acima) --
  // sem essa trava, apertar Enter em qualquer campo da etapa 3 (ex.:
  // digitando a data) já salvava e fechava o modal na hora, sem dar
  // chance de revisar/editar antes. Enter continua funcionando normal
  // em qualquer textarea (ex.: Observações).
  function bloquearEnvioPorEnter(e) {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  }

  return (

    <form
      onSubmit={handleSubmit}
      onKeyDown={bloquearEnvioPorEnter}
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

      <div
        className="
          sticky bottom-0 -mx-8 -mb-8 mt-4
          flex justify-between items-center
          gap-3
          border-t border-[var(--border-token)]
          bg-[var(--surface)]
          px-8 py-5
        "
      >

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

        <button
          type="button"
          onClick={avancarOuSalvar}
          disabled={step === 3 && salvando}
          className="bg-emerald-600 hover:bg-emerald-700 text-[var(--text)] px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step < 3
            ? "Continuar"
            : salvando
              ? "Salvando..."
              : inquilino
                ? "Salvar Alterações"
                : "Salvar Inquilino"}
        </button>

      </div>

    </form>

  );

}