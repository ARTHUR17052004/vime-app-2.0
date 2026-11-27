"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, Download, Trash2, Camera } from "lucide-react";

import Button from "../ui/Button";
import SeletorBusca from "../ui/SeletorBusca";
import CameraCapture, { cameraSuportada } from "../ui/CameraCapture";

import { LocadorService } from "@/services/locadores.service";
import { UnidadeService } from "@/services/unidades.service";
import { KitnetService } from "@/services/kitnets.service";
import { InquilinoService } from "@/services/inquilinos.service";
import { CamposObrigatoriosService } from "@/services/camposObrigatorios.service";
import { obterCamposFaltando, mensagemCamposFaltando } from "@/utils/validacaoObrigatorios";
import { ordenarPorNumero } from "@/utils/ordenarKitnets";
import { calcularFimCicloAtual } from "@/utils/cicloContrato";

const CAMPOS = [
  "locadorId", "unidadeId", "kitnetId", "inquilinoId", "dataInicio", "dataFim",
  "valorAluguel", "diaVencimento",
];

const SEMPRE_OBRIGATORIOS = new Set([
  "locadorId", "unidadeId", "kitnetId", "inquilinoId", "dataInicio", "valorAluguel", "diaVencimento",
]);

const ROTULOS = {
  locadorId: "Locador",
  unidadeId: "Residência",
  kitnetId: "Kitnet",
  inquilinoId: "Inquilino",
  dataInicio: "Início do Contrato",
  dataFim: "Data Final do Contrato",
  valorAluguel: "Valor do Aluguel",
  diaVencimento: "Dia do Vencimento",
};

// Mesmo padrão de rótulo+estrelinha usado em ContratoStep.jsx (cadastro
// de inquilino) -- aqui o form inteiro estava sem label nenhum, então
// não tinha como saber o que era obrigatório ou não.
function Campo({ label, obrigatorio, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-[var(--text-subtle)]">
        {label}
        {obrigatorio && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function ContratoForm({
  onSave,
  onCancel,
  contrato,
  // "Adicionar Contrato" (Arquivo de Contratos): contrato que já existia
  // em papel, sem assinatura digital -- mesmos campos, só adiciona o
  // anexo do arquivo real.
  modoManual = false,
  arquivoSelecionado,
  onArquivoSelecionado,
  onBaixarArquivoAtual,
  onRemoverArquivoAtual,
}) {

  const [obrigatorios, setObrigatorios] =
    useState(new Set());

  const [erro, setErro] = useState("");

  const inputCameraArquivoRef = useRef(null);
  const [cameraAberta, setCameraAberta] = useState(false);

  function abrirCamera() {
    if (cameraSuportada()) {
      setCameraAberta(true);
    } else {
      inputCameraArquivoRef.current?.click();
    }
  }

  useEffect(() => {

    async function carregarObrigatorios() {

      try {

        const resposta = await CamposObrigatoriosService.listar("contrato");
        const lista = Array.isArray(resposta) ? resposta : resposta.data || [];

        setObrigatorios(
          new Set(lista.filter((c) => c.obrigatorio).map((c) => c.campo))
        );

      } catch (err) {

        console.error(err);

      }

    }

    carregarObrigatorios();

  }, []);

  const [locadores, setLocadores] =
    useState([]);

  const [unidades, setUnidades] =
    useState([]);

  const [kitnets, setKitnets] =
    useState([]);

  const [inquilinos, setInquilinos] =
    useState([]);

  const [salvando, setSalvando] =
    useState(false);

  // Mudar o dia de vencimento desloca a data de TODA cobrança futura
  // gerada automaticamente desse contrato, não só da atual -- trava com
  // senha (re-autenticação) só nesse campo, explicando o motivo (ver
  // exigirConfirmacaoEdicaoVencimentoContrato no backend). Pedido do
  // usuário em 25/11/2026.
  const [confirmandoVencimento, setConfirmandoVencimento] = useState(false);
  const [senhaConfirmacaoVencimento, setSenhaConfirmacaoVencimento] = useState("");
  const [erroConfirmacaoVencimento, setErroConfirmacaoVencimento] = useState("");
  const [payloadPendente, setPayloadPendente] = useState(null);

  const [formData, setFormData] =
    useState({

      locadorId: "",

      unidadeId: "",

      kitnetId: "",

      inquilinoId: "",

      dataInicio: "",

      dataFim: "",

      valorAluguel: "",

      diaVencimento: "",

      // Contrato novo nasce PENDENTE -- só vira ATIVO de verdade quando
      // alguém assina na Clicksign (ver clicksignService.js, webhook de
      // assinatura). Bug relatado em 27/11/2026: contrato aparecia
      // "Ativo" na lista mesmo recém-enviado, ainda esperando a
      // inquilina assinar.
      status: "PENDENTE",

      observacoes: "",

    });

  async function carregarDados() {

    try {

      const [

        locadoresRes,

        unidadesRes,

        kitnetsRes,

        inquilinosRes,

      ] = await Promise.all([

        LocadorService.listar(),

        UnidadeService.listar(),

        KitnetService.listar(),

        InquilinoService.listar(),

      ]);

      setLocadores(

        Array.isArray(locadoresRes)
          ? locadoresRes
          : locadoresRes.data || []

      );

      setUnidades(

        Array.isArray(unidadesRes)
          ? unidadesRes
          : unidadesRes.data || []

      );

      setKitnets(

        Array.isArray(kitnetsRes)
          ? kitnetsRes
          : kitnetsRes.data || []

      );

      setInquilinos(

        Array.isArray(inquilinosRes)
          ? inquilinosRes
          : inquilinosRes.data || []

      );

    } catch (error) {

      console.error(
        "Erro ao carregar dados:",
        error
      );

    }

  }

  useEffect(() => {

    carregarDados();

  }, []);

  useEffect(() => {

    if (!contrato) return;

    setFormData({

      ...formData,

      ...contrato,

      // <input type="date"> só aceita "aaaa-mm-dd" -- a API devolve
      // data/hora completa (ISO), e sem cortar pros 10 primeiros
      // caracteres os campos apareciam em branco mesmo com data salva.
      dataInicio: (contrato.dataInicio || "").slice(0, 10),
      dataFim: (contrato.dataFim || "").slice(0, 10),

    });

  }, [contrato]);


      function alterarCampo(e) {

    const { name, value } = e.target;

    setErro("");

    if (name === "locadorId") {

      setFormData((prev) => ({

        ...prev,

        locadorId: value,

        unidadeId: "",

        kitnetId: "",

        inquilinoId: "",

      }));

      return;

    }

    if (name === "unidadeId") {

      setFormData((prev) => ({

        ...prev,

        unidadeId: value,

        kitnetId: "",

        inquilinoId: "",

      }));

      return;

    }

    if (name === "kitnetId") {

      setFormData((prev) => ({

        ...prev,

        kitnetId: value,

        inquilinoId: "",

      }));

      return;

    }

    // Escolher o inquilino direto (sem ter escolhido locador/residência/
    // kitnet antes) já preenche tudo sozinho, puxando do próprio
    // cadastro dele (etapa 3: garantia, caução, reajuste, datas) e da
    // kitnet (valor do aluguel) -- é o caminho mais rápido pra quem já
    // sabe quem é o inquilino (ex.: "Adicionar Contrato" no Arquivo),
    // sem precisar redigitar o que já foi cadastrado.
    if (name === "inquilinoId") {

      const inquilino = inquilinos.find((i) => i.id === value);

      // Mesmo padrão default do contrato gerado automático na etapa 3
      // do cadastro de inquilino (ver inquilinoService.js) -- dia fixo
      // da própria kitnet (não mais da Residência -- pedido do usuário
      // em 27/11/2026), senão o dia do mês do início do contrato.
      const diaVencimentoPadrao =
        inquilino?.kitnet?.diaVencimento ||
        (inquilino?.dataInicioContrato ? new Date(inquilino.dataInicioContrato).getDate() : null);

      setFormData((prev) => ({

        ...prev,

        inquilinoId: value,

        ...(inquilino?.kitnetId && {
          kitnetId: inquilino.kitnetId,
          unidadeId: inquilino.kitnet?.unidadeId || prev.unidadeId,
          locadorId: inquilino.kitnet?.unidade?.locadorId || prev.locadorId,
        }),

        ...(inquilino?.kitnet?.aluguel != null && { valorAluguel: String(inquilino.kitnet.aluguel) }),
        ...(diaVencimentoPadrao && { diaVencimento: String(diaVencimentoPadrao) }),

        // Início vale a pena puxar nos dois modos (quem cadastrou o
        // inquilino já digitou essa data lá na etapa 3) -- dá pra
        // sobrescrever na mão se o Arquivo for de uma data diferente.
        // Fim só existe como campo no modo normal -- no Arquivo é
        // sempre calculado (ver salvar()), nunca digitado.
        ...(inquilino?.dataInicioContrato && {
          dataInicio: String(inquilino.dataInicioContrato).slice(0, 10),
        }),
        ...(!modoManual && inquilino?.dataFimContrato && {
          dataFim: String(inquilino.dataFimContrato).slice(0, 10),
        }),

      }));

      return;

    }

    if (name === "dataInicio") {

      setFormData((prev) => {

        const novo = { ...prev, dataInicio: value };

        // Sugere a data final automaticamente (4 meses após o início)
        // só se o usuário ainda não tiver escolhido uma própria.
        //
        // O input de data dispara onChange a cada dígito digitado --
        // enquanto o ano está pela metade (ex.: "0002" no meio de
        // "2025"), value já é uma data "válida" só que com ano errado.
        // Sem essa checagem, essa data quebrada era gravada e, como o
        // campo deixa de estar vazio, nunca mais era recalculada.
        const anoCompleto = /^\d{4}-\d{2}-\d{2}$/.test(value) && Number(value.slice(0, 4)) >= 1900;

        if (anoCompleto && !prev.dataFim) {
          const data = new Date(value);
          data.setMonth(data.getMonth() + 4);
          novo.dataFim = data.toISOString().slice(0, 10);
        }

        return novo;

      });

      return;

    }

    setFormData((prev) => ({

      ...prev,

      [name]: value,

    }));

  }

  async function executarSave(payloadExtra = {}) {

    setSalvando(true);

    try {

      // No Arquivo, o Início é digitado na tela (geralmente bem antigo
      // -- o contrato pode já ter "renovado" várias vezes sozinho desde
      // então). O Fim não é mais digitado: é sempre o fim do ciclo de 4
      // meses em que "hoje" cai (ver calcularFimCicloAtual) -- bater só
      // "início + 4 meses" podia gerar uma data lá no passado e o job
      // de fim de contrato fecharia o contrato (e esvaziaria a kitnet!)
      // na hora seguinte, mesmo o inquilino ainda morando lá.
      const dataFimCalculada = modoManual
        ? calcularFimCicloAtual(formData.dataInicio)
        : null;

      await onSave({

        ...formData,

        ...(modoManual && !contrato ? { origem: "MANUAL" } : {}),

        // Tipo de Garantia/Valor da Caução/Índice de Reajuste não
        // existem mais nessa tela (removidos em 16/11/2026 -- pedido
        // do usuário) -- ignora de vez, mesmo se o admin tiver marcado
        // algum deles como obrigatório em Campos Obrigatórios. dataFim
        // idem no Arquivo: sempre calculada aqui, nunca "faltando".
        ignorarObrigatorios: [
          "tipoGarantia",
          "valorCaucao",
          "indiceReajuste",
          ...(modoManual ? ["dataFim"] : []),
        ],

        dataInicio: formData.dataInicio,

        valorAluguel: Number(formData.valorAluguel),

        diaVencimento: Number(formData.diaVencimento),

        dataFim: modoManual
          ? (dataFimCalculada ? dataFimCalculada.fimCiclo.toISOString().slice(0, 10) : null)
          : (formData.dataFim || null),

        ...payloadExtra,

      });

    } finally {

      setSalvando(false);

    }

  }

  async function salvar(e) {

    e.preventDefault();

    const exigidos = new Set([...obrigatorios, ...SEMPRE_OBRIGATORIOS]);

    // No Arquivo de Contratos (modoManual) dataFim nem aparece na tela
    // -- não é mais digitada, é calculada sozinha a partir do Início
    // (ver calcularFimCicloAtual logo abaixo), não faz sentido exigir.
    const campos = modoManual
      ? CAMPOS.filter((c) => c !== "dataFim")
      : CAMPOS;

    const faltando = obterCamposFaltando(campos, formData, exigidos, ROTULOS);

    if (faltando.length > 0) {
      setErro(mensagemCamposFaltando(faltando));
      return;
    }

    setErro("");

    // Mudou o dia de vencimento de um contrato já existente? Pede
    // senha antes de mandar pro backend (ver exigirConfirmacaoEdicaoVencimentoContrato).
    // Criar um contrato novo, ou editar qualquer outro campo, segue
    // direto sem essa trava.
    if (contrato && Number(formData.diaVencimento) !== Number(contrato.diaVencimento)) {
      setPayloadPendente(true);
      setSenhaConfirmacaoVencimento("");
      setErroConfirmacaoVencimento("");
      setConfirmandoVencimento(true);
      return;
    }

    try {
      await executarSave();
    } catch {
      // erro já é exibido pelo chamador (onSave)
    }

  }

  async function confirmarEdicaoVencimento(e) {

    e.preventDefault();

    if (!senhaConfirmacaoVencimento) {
      setErroConfirmacaoVencimento("Digite sua senha pra confirmar.");
      return;
    }

    setErroConfirmacaoVencimento("");

    try {

      await executarSave({ senhaConfirmacao: senhaConfirmacaoVencimento });

      setConfirmandoVencimento(false);
      setPayloadPendente(null);
      setSenhaConfirmacaoVencimento("");

    } catch (err) {

      // Mantém o modal aberto -- senha errada é pra corrigir e tentar
      // de novo, sem perder os dados do formulário.
      setErroConfirmacaoVencimento(err.message || "Não foi possível confirmar a edição do vencimento.");

    }

  }

  // Preview em tempo real pro usuário ver o que vai ser calculado antes
  // de salvar -- mesma conta que salvar() usa de verdade.
  const cicloAtual = useMemo(() => {
    return modoManual ? calcularFimCicloAtual(formData.dataInicio) : null;
  }, [modoManual, formData.dataInicio]);

  const input = `
    w-full
    rounded-xl
    border
    border-[var(--border-token)]
    bg-[var(--surface-2)]
    px-4
    py-3
    text-[var(--text)]
    outline-none
    transition-all
    focus:border-emerald-500
  `;

  return (

    <form
      onSubmit={salvar}
      noValidate
      className="space-y-8"
    >

      <div>

        <h2
          className="
            text-3xl
            font-black
            text-[var(--text)]
          "
        >

          {contrato

            ? "Editar Contrato"

            : "Novo Contrato"}

        </h2>

        <p className="mt-2 text-[var(--text-subtle)]">

          Preencha as informações do contrato.

        </p>

      </div>

      <div className="grid md:grid-cols-2 gap-5">

        <Campo label="Locador" obrigatorio>
        <select
          name="locadorId"
          value={formData.locadorId}
          onChange={alterarCampo}
          className={input}
          required
        >

          <option
            value=""
            style={{
              backgroundColor:"#1d2833",
              color:"#fff"
            }}
          >

            Selecione um Locador

          </option>

          {locadores.map((locador)=>(

            <option
              key={locador.id}
              value={locador.id}
              style={{
                backgroundColor:"#1d2833",
                color:"#fff"
              }}
            >

              {locador.nome}

            </option>

          ))}

        </select>
        </Campo>

        <Campo label="Residência" obrigatorio>
        <select
          name="unidadeId"
          value={formData.unidadeId}
          onChange={alterarCampo}
          className={input}
          required
        >

          <option
            value=""
            style={{
              backgroundColor:"#1d2833",
              color:"#fff"
            }}
          >

            Selecione uma Residência

          </option>

          {unidades.map((unidade)=>(

            <option
              key={unidade.id}
              value={unidade.id}
              style={{
                backgroundColor:"#1d2833",
                color:"#fff"
              }}
            >

              {unidade.nome}

            </option>

          ))}

        </select>
        </Campo>

        <Campo label="Kitnet" obrigatorio>
        <select
          name="kitnetId"
          value={formData.kitnetId}
          onChange={alterarCampo}
          className={input}
          required
          disabled={!formData.unidadeId}
        >

          <option
            value=""
            style={{
              backgroundColor:"#1d2833",
              color:"#fff"
            }}
          >

            {formData.unidadeId ? "Selecione uma Kitnet" : "Selecione uma Residência primeiro"}

          </option>

          {/* Só as kitnets da residência escolhida -- com tudo junto
              ficava impossível saber qual kitnet era de qual Residência.
              Ordenada por número (a API devolve por data de criação, que
              vira uma bagunça tipo 17, 13, 12... em vez de 01, 02, 03...). */}
          {ordenarPorNumero(kitnets.filter((kitnet) => kitnet.unidadeId === formData.unidadeId))
            .map((kitnet)=>(

            <option
              key={kitnet.id}
              value={kitnet.id}
              style={{
                backgroundColor:"#1d2833",
                color:"#fff"
              }}
            >

              {kitnet.nome || `Kitnet ${kitnet.numero}`}

            </option>

          ))}

        </select>
        </Campo>

        <Campo label="Inquilino" obrigatorio>
        <SeletorBusca
          opcoes={inquilinos.map((i) => ({ value: i.id, label: i.nome }))}
          value={formData.inquilinoId}
          onChange={(value) => alterarCampo({ target: { name: "inquilinoId", value } })}
          placeholder="Busque pelo nome do inquilino"
          className={input}
          required
        />
        </Campo>

      </div>

      <div className="grid md:grid-cols-2 gap-5">

        <Campo label="Início do Contrato" obrigatorio>
          <input
            className={input}
            type="date"
            name="dataInicio"
            value={formData.dataInicio}
            onChange={alterarCampo}
            required
          />
        </Campo>

        {/* No Arquivo (contrato antigo, de outro sistema) o Fim não é
            digitado -- é calculado sozinho a partir do Início, em
            ciclos de 4 meses, pra achar em qual ciclo "hoje" cai (o
            contrato pode já ter "renovado" várias vezes sozinho desde
            aquele Início, que costuma ser de anos atrás). */}
        {modoManual ? (
          <Campo label="Data Final do Contrato (calculada)">
            <div className={`${input} flex items-center justify-between gap-2`}>
              <span>
                {cicloAtual
                  ? cicloAtual.fimCiclo.toLocaleDateString("pt-BR")
                  : "Preencha o Início do Contrato"}
              </span>
              {cicloAtual && (
                <span className="shrink-0 text-xs text-[var(--text-faint)]">
                  {cicloAtual.numeroCiclo}º ciclo de 4 meses
                </span>
              )}
            </div>
          </Campo>
        ) : (
          <Campo label="Data Final do Contrato" obrigatorio={obrigatorios.has("dataFim")}>
            <input
              className={input}
              type="date"
              name="dataFim"
              value={formData.dataFim}
              onChange={alterarCampo}
              required={obrigatorios.has("dataFim")}
            />
          </Campo>
        )}

        <Campo label="Valor do Aluguel" obrigatorio>
        <input
          className={input}
          type="number"
          name="valorAluguel"
          placeholder="Valor do aluguel"
          value={formData.valorAluguel}
          onChange={alterarCampo}
          required
        />
        </Campo>

        <Campo label="Dia do Vencimento" obrigatorio>
        <input
          className={input}
          type="number"
          name="diaVencimento"
          placeholder="Dia do vencimento"
          min={1}
          max={31}
          value={formData.diaVencimento}
          onChange={alterarCampo}
          required
        />
        </Campo>

       <Campo label="Status">
       <select
  name="status"
  value={formData.status}
  onChange={alterarCampo}
  className={input}
>

  <option
    value="ATIVO"
    style={{
      backgroundColor: "#1d2833",
      color: "#fff",
    }}
  >
    Ativo
  </option>

  <option
    value="PENDENTE"
    style={{
      backgroundColor: "#1d2833",
      color: "#fff",
    }}
  >
    Pendente
  </option>

  {/* "Encerrado" tirado de propósito -- editar esse campo direto aqui
      pulava toda a cascata (liberar kitnet, desativar inquilino,
      cancelar receita recorrente, notificar, cancelar envelope da
      Clicksign). Pra encerrar, usar o botão dedicado "Encerrar
      contrato" (já pede senha + motivo). Bug relatado em 23/11/2026:
      kitnet 22 da VIME I ficou "Ocupada" fantasma porque o contrato
      foi encerrado editando esse campo, não pelo botão. */}

  <option
    value="ASSINADO"
    style={{
      backgroundColor: "#1d2833",
      color: "#fff",
    }}
  >
    Assinado
  </option>

</select>
</Campo>

</div>

<textarea
  name="observacoes"
  value={formData.observacoes}
  onChange={alterarCampo}
  placeholder="Observações..."
  className={`
    ${input}
    min-h-[140px]
    resize-none
  `}
/>

{modoManual && (
  <div className="rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] p-5 space-y-3">

    <p className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
      <Paperclip size={16} />
      Arquivo do contrato (PDF ou foto)
    </p>

    {contrato?.arquivoNomeOriginal && !arquivoSelecionado && (
      <div className="flex items-center justify-between gap-3 rounded-lg bg-[var(--surface)] px-4 py-3">
        <span className="text-sm text-[var(--text-subtle)] truncate">
          {contrato.arquivoNomeOriginal}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBaixarArquivoAtual}
            className="text-emerald-400 hover:text-emerald-300 transition"
            aria-label="Baixar arquivo atual"
          >
            <Download size={16} />
          </button>
          <button
            type="button"
            onClick={onRemoverArquivoAtual}
            className="text-red-400 hover:text-red-300 transition"
            aria-label="Remover arquivo atual"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    )}

    <div className="flex items-center gap-2">

      <button
        type="button"
        onClick={abrirCamera}
        title="Tirar foto"
        className="
          w-10 h-10 rounded-xl
          border border-[var(--border-token)]
          bg-[var(--surface)]
          text-[var(--text-subtle)]
          hover:border-emerald-500/40 hover:text-emerald-400
          transition
          flex items-center justify-center
          shrink-0
        "
      >
        <Camera size={16} />
      </button>

      <input
        type="file"
        accept=".pdf,image/*"
        onChange={(e) => onArquivoSelecionado?.(e.target.files?.[0] || null)}
        className="text-sm text-[var(--text-subtle)] file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-600"
      />

      <input
        ref={inputCameraArquivoRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => onArquivoSelecionado?.(e.target.files?.[0] || null)}
        className="hidden"
      />

      <CameraCapture
        aberto={cameraAberta}
        onFechar={() => setCameraAberta(false)}
        onCapturar={(arquivo) => {
          setCameraAberta(false);
          onArquivoSelecionado?.(arquivo);
        }}
      />

    </div>

    {arquivoSelecionado && (
      <p className="text-xs text-emerald-400">Selecionado: {arquivoSelecionado.name}</p>
    )}

    <p className="text-xs text-[var(--text-faint)]">
      {contrato
        ? "Escolher um novo arquivo substitui o atual ao salvar."
        : "Opcional -- dá pra anexar depois, editando o contrato."}
    </p>

  </div>
)}

{erro && (
  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
    {erro}
  </div>
)}

{confirmandoVencimento && (

  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">

    <form
      onSubmit={confirmarEdicaoVencimento}
      autoComplete="off"
      className="w-full max-w-md rounded-2xl border border-yellow-500/30 bg-[var(--surface)] p-7 space-y-5"
    >

      <h3 className="text-xl font-bold text-yellow-400">
        Confirmar mudança de vencimento
      </h3>

      <p className="text-sm text-[var(--text-muted)]">
        Mudar o dia de vencimento de {contrato?.diaVencimento} pra {formData.diaVencimento}
        altera a data de TODAS as próximas cobranças geradas automaticamente desse contrato, não
        só da atual. Digite sua senha pra confirmar.
      </p>

      <div>
        <label className="block text-xs text-[var(--text-faint)] mb-1.5">
          Sua senha
        </label>
        <input
          type="password"
          name="senhaConfirmacaoEdicaoVencimentoContrato"
          autoComplete="new-password"
          autoFocus
          value={senhaConfirmacaoVencimento}
          onChange={(e) => setSenhaConfirmacaoVencimento(e.target.value)}
          className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full"
        />
      </div>

      {erroConfirmacaoVencimento && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {erroConfirmacaoVencimento}
        </div>
      )}

      <div className="flex justify-end gap-3">

        <button
          type="button"
          onClick={() => {
            setConfirmandoVencimento(false);
            setPayloadPendente(null);
            setSenhaConfirmacaoVencimento("");
          }}
          className="px-5 py-2.5 rounded-xl border border-[var(--border-token)] text-[var(--text-muted)]"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={salvando}
          className="px-5 py-2.5 rounded-xl bg-yellow-600 text-white font-semibold disabled:opacity-60"
        >
          {salvando ? "Confirmando..." : "Confirmar"}
        </button>

      </div>

    </form>

  </div>

)}

<div
  className="
    sticky bottom-0 -mx-8 -mb-8 mt-4
    flex flex-col-reverse sm:flex-row sm:justify-end
    gap-3 sm:gap-4
    border-t
    border-[var(--border-token)]
    bg-[var(--surface)]
    px-8 py-5
  "
>

  <Button
    type="button"
    variant="secondary"
    className="w-full sm:w-auto"
    onClick={onCancel}
    disabled={salvando}
  >
    Cancelar
  </Button>

  <Button type="submit" className="w-full sm:w-auto" disabled={salvando}>

    {salvando
      ? "Salvando..."
      : contrato
        ? "Salvar Alterações"
        : "Criar Contrato"}

  </Button>

</div>

</form>

);

}