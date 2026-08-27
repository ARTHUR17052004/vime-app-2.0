"use client";

import { useEffect, useState } from "react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";

import { UnidadeService } from "@/services/unidades.service";
import { KitnetService } from "@/services/kitnets.service";
import { CamposObrigatoriosService } from "@/services/camposObrigatorios.service";
import { obterCamposFaltando, mensagemCamposFaltando } from "@/utils/validacaoObrigatorios";

// "Nome da Vistoria" é sempre exigido -- vira a coluna "titulo" no
// banco, que não aceita nulo, independente do que for configurado em
// Campos Obrigatórios.
const SEMPRE_OBRIGATORIOS = new Set(["nomeVistoria"]);

const CAMPOS = [
  "nomeVistoria", "unidadeId", "kitnetId", "categoria",
  "criticidade", "periodicidade", "responsavel", "dataProxima", "observacoes",
];

const ROTULOS = {
  nomeVistoria: "Nome da Vistoria",
  unidadeId: "Residência",
  kitnetId: "Kitnet",
  categoria: "Categoria",
  criticidade: "Criticidade",
  periodicidade: "Periodicidade",
  responsavel: "Responsável",
  dataProxima: "Data Próxima",
  observacoes: "Observações",
};

export default function VistoriaForm({
  onSave,
  vistoriaEditando,
}) {

  const [residencias, setResidencias] = useState([]);
  const [kitnets, setKitnets] = useState([]);

  const [obrigatorios, setObrigatorios] = useState(new Set());
  const [erro, setErro] = useState("");

  const [formData, setFormData] = useState({
    unidadeId: "",
    kitnetId: "",

    nomeVistoria: "",

    categoria: "Preventiva",

    criticidade: "Média",

    periodicidade: "Mensal",

    responsavel: "",

    dataUltima: "",

    dataProxima: "",

    status: "PROGRAMADA",

    observacoes: "",

    fotos: [],

    checklist: {
      portao: false,
      telhado: false,
      caixaAgua: false,
      extintores: false,
      iluminacao: false,
      corredores: false,
    },
  });

  useEffect(() => {

    async function carregarResidencias() {

      try {

        const resposta = await UnidadeService.listar();

        setResidencias(
          Array.isArray(resposta) ? resposta : resposta.data || []
        );

      } catch (err) {

        console.error("Erro ao carregar residências:", err);

      }

    }

    carregarResidencias();

  }, []);

  useEffect(() => {

    async function carregarObrigatorios() {

      try {

        const resposta = await CamposObrigatoriosService.listar("vistoria");
        const lista = Array.isArray(resposta) ? resposta : resposta.data || [];

        // O campo se chama "titulo" no banco, mas "nomeVistoria" aqui
        // no formulário.
        const MAPA = { titulo: "nomeVistoria" };

        setObrigatorios(
          new Set(
            lista
              .filter((c) => c.obrigatorio)
              .map((c) => MAPA[c.campo] || c.campo)
          )
        );

      } catch (err) {

        console.error(err);

      }

    }

    carregarObrigatorios();

  }, []);

  useEffect(() => {

    async function carregarKitnets() {

      try {

        const resposta = await KitnetService.listar();

        const lista = Array.isArray(resposta)
          ? resposta
          : resposta.data || [];

        setKitnets(
          formData.unidadeId
            ? lista.filter(
                (kitnet) => kitnet.unidadeId === formData.unidadeId
              )
            : lista
        );

      } catch (err) {

        console.error("Erro ao carregar kitnets:", err);

      }

    }

    carregarKitnets();

  }, [formData.unidadeId]);

  useEffect(() => {

    if (vistoriaEditando) {

      setFormData({
        ...formData,
        ...vistoriaEditando,
      });

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vistoriaEditando]);

  const handleChange = (e) => {

    const { name, value } = e.target;

    if (name === "unidadeId") {

      setFormData((prev) => ({
        ...prev,
        unidadeId: value,
        kitnetId: "",
      }));

      return;

    }

    setFormData({
      ...formData,
      [name]: value,
    });

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    const exigidos = new Set([...obrigatorios, ...SEMPRE_OBRIGATORIOS]);

    const faltando = obterCamposFaltando(CAMPOS, formData, exigidos, ROTULOS);

    if (faltando.length > 0) {
      setErro(mensagemCamposFaltando(faltando));
      return;
    }

    setErro("");

    onSave(formData);

  };

  const input = `
    w-full
    rounded-xl
    border
    border-[var(--border-token)]
    bg-[var(--surface-2)]
    px-4
    py-3
    text-[var(--text)]
    placeholder:text-[var(--text-faint)]
    outline-none
    focus:border-emerald-500
  `;

  return (

    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-8"
    >

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="font-semibold text-[var(--text-muted)]">
            Residência
            {obrigatorios.has("unidadeId") && <span className="ml-1 text-red-400">*</span>}
          </label>

          <Select
            name="unidadeId"
            value={formData.unidadeId}
            onChange={handleChange}
            required={obrigatorios.has("unidadeId")}
            className={input}
          >
            <option value="" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
              Selecione...
            </option>

            {residencias.map((residencia) => (
              <option
                key={residencia.id}
                value={residencia.id}
                style={{ backgroundColor: "#1d2833", color: "#fff" }}
              >
                {residencia.nome}
              </option>
            ))}
          </Select>

        </div>

        <div>

          <label className="font-semibold text-[var(--text-muted)]">
            Kitnet
            {obrigatorios.has("kitnetId") && <span className="ml-1 text-red-400">*</span>}
          </label>

          <Select
            name="kitnetId"
            value={formData.kitnetId}
            onChange={handleChange}
            required={obrigatorios.has("kitnetId")}
            className={input}
          >
            <option value="" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
              Selecione...
            </option>

            {kitnets.map((kitnet) => (
              <option
                key={kitnet.id}
                value={kitnet.id}
                style={{ backgroundColor: "#1d2833", color: "#fff" }}
              >
                {kitnet.nome || `APT ${kitnet.numero}`}
              </option>
            ))}
          </Select>

        </div>

      </div>

      <div>

        <label className="font-semibold text-[var(--text-muted)]">
          Nome da Vistoria
          <span className="ml-1 text-red-400">*</span>
        </label>

        <Input
          name="nomeVistoria"
          value={formData.nomeVistoria}
          onChange={handleChange}
          placeholder="Ex: Limpeza das Áreas Comuns"
          required
          className={input}
        />

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="font-semibold text-[var(--text-muted)]">
            Categoria
            {obrigatorios.has("categoria") && <span className="ml-1 text-red-400">*</span>}
          </label>

          <Select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required={obrigatorios.has("categoria")}
            className={input}
          >

            <option>Preventiva</option>
            <option>Corretiva</option>
            <option>Inspeção</option>
            <option>Limpeza</option>
            <option>Segurança</option>
            <option>Estrutural</option>

          </Select>

        </div>

        <div>

          <label className="font-semibold text-[var(--text-muted)]">
            Criticidade
            {obrigatorios.has("criticidade") && <span className="ml-1 text-red-400">*</span>}
          </label>

          <Select
            name="criticidade"
            value={formData.criticidade}
            onChange={handleChange}
            required={obrigatorios.has("criticidade")}
            className={input}
          >

            <option>Baixa</option>
            <option>Média</option>
            <option>Alta</option>
            <option>Crítica</option>

          </Select>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="font-semibold text-[var(--text-muted)]">
            Periodicidade
            {obrigatorios.has("periodicidade") && <span className="ml-1 text-red-400">*</span>}
          </label>

          <Select
            name="periodicidade"
            value={formData.periodicidade}
            onChange={handleChange}
            required={obrigatorios.has("periodicidade")}
            className={input}
          >

            <option>Semanal</option>
            <option>Quinzenal</option>
            <option>Mensal</option>
            <option>Bimestral</option>
            <option>Trimestral</option>
            <option>Semestral</option>
            <option>Anual</option>

          </Select>

        </div>

      <div>

  <label className="font-semibold text-[var(--text-muted)]">
    Responsável
    {obrigatorios.has("responsavel") && <span className="ml-1 text-red-400">*</span>}
  </label>

  <Input
    name="responsavel"
    value={formData.responsavel}
    onChange={handleChange}
    placeholder="Nome do responsável"
    required={obrigatorios.has("responsavel")}
    className={input}
  />

</div>

</div>

<div className="grid md:grid-cols-2 gap-6">

  <div>

    <label className="font-semibold text-[var(--text-muted)]">
      Data Última
    </label>

    <Input
      type="date"
      name="dataUltima"
      value={formData.dataUltima}
      onChange={handleChange}
      className={input}
    />

  </div>

  <div>

    <label className="font-semibold text-[var(--text-muted)]">
      Data Próxima
      {obrigatorios.has("dataProxima") && <span className="ml-1 text-red-400">*</span>}
    </label>

    <Input
      type="date"
      name="dataProxima"
      value={formData.dataProxima}
      onChange={handleChange}
      required={obrigatorios.has("dataProxima")}
      className={input}
    />

  </div>

</div>

<div>

  <label className="font-semibold text-[var(--text-muted)]">
    Status
  </label>

  <Select
    name="status"
    value={formData.status}
    onChange={handleChange}
    className={input}
  >

    <option>PROGRAMADA</option>
    <option>PENDENTE</option>
    <option>REALIZADA</option>
    <option>CANCELADA</option>
    <option>ATRASADA</option>

  </Select>

</div>

<div>

  <label className="font-semibold text-[var(--text-muted)] block mb-4">
    Checklist da Vistoria
  </label>

  <div className="grid md:grid-cols-2 gap-4">

    <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4 text-[var(--text-muted)]">
      <input
        type="checkbox"
        checked={formData.checklist.portao}
        onChange={(e) =>
          setFormData({
            ...formData,
            checklist: {
              ...formData.checklist,
              portao: e.target.checked,
            },
          })
        }
      />
      <span>Portão</span>
    </label>

    <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4 text-[var(--text-muted)]">
      <input
        type="checkbox"
        checked={formData.checklist.telhado}
        onChange={(e) =>
          setFormData({
            ...formData,
            checklist: {
              ...formData.checklist,
              telhado: e.target.checked,
            },
          })
        }
      />
      <span>Telhado</span>
    </label>

    <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4 text-[var(--text-muted)]">
      <input
        type="checkbox"
        checked={formData.checklist.caixaAgua}
        onChange={(e) =>
          setFormData({
            ...formData,
            checklist: {
              ...formData.checklist,
              caixaAgua: e.target.checked,
            },
          })
        }
      />
      <span>Caixa de Água</span>
    </label>

    <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4 text-[var(--text-muted)]">
      <input
        type="checkbox"
        checked={formData.checklist.extintores}
        onChange={(e) =>
          setFormData({
            ...formData,
            checklist: {
              ...formData.checklist,
              extintores: e.target.checked,
            },
          })
        }
      />
      <span>Extintores</span>
    </label>

    <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4 text-[var(--text-muted)]">
      <input
        type="checkbox"
        checked={formData.checklist.iluminacao}
        onChange={(e) =>
          setFormData({
            ...formData,
            checklist: {
              ...formData.checklist,
              iluminacao: e.target.checked,
            },
          })
        }
      />
      <span>Iluminação</span>
    </label>

    <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4 text-[var(--text-muted)]">
      <input
        type="checkbox"
        checked={formData.checklist.corredores}
        onChange={(e) =>
          setFormData({
            ...formData,
            checklist: {
              ...formData.checklist,
              corredores: e.target.checked,
            },
          })
        }
      />
      <span>Corredores</span>
    </label>

  </div>

</div>

<div>

  <label className="font-bold text-[var(--text-muted)] text-lg block mb-4">
    Fotos e Vídeos da Vistoria
  </label>

  <Input
    type="file"
    multiple
    accept="image/*,video/*"
    className={input}
    onChange={(e) => {

      const arquivos = Array.from(
        e.target.files || []
      );

      arquivos.forEach((arquivo) => {

        const reader = new FileReader();

        reader.onload = () => {

          setFormData((prev) => ({

            ...prev,

            fotos: [
              ...(prev.fotos || []),
              reader.result,
            ],

          }));

        };

        reader.readAsDataURL(arquivo);

      });

    }}
  />

  {formData.fotos?.length > 0 && (

    <div className="grid md:grid-cols-3 gap-4 mt-6">

      {formData.fotos.map((foto, index) =>
        foto.startsWith("data:video") ? (
          <video
            key={index}
            src={foto}
            controls
            className="
              w-full
              h-40
              object-cover
              rounded-2xl
              border
              border-[var(--border-token)]
            "
          />
        ) : (
          <img
            key={index}
            src={foto}
            alt={`Foto ${index}`}
            className="
              w-full
              h-40
              object-cover
              rounded-2xl
              border
              border-[var(--border-token)]
            "
          />
        )
      )}

    </div>

  )}

</div>

<div>

  <label className="font-semibold text-[var(--text-muted)]">
    Observações
    {obrigatorios.has("observacoes") && <span className="ml-1 text-red-400">*</span>}
  </label>

  <Textarea
    rows={6}
    name="observacoes"
    value={formData.observacoes}
    onChange={handleChange}
    required={obrigatorios.has("observacoes")}
    className={`
      ${input}
      min-h-[160px]
      resize-none
    `}
  />

</div>

{erro && (
  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
    {erro}
  </div>
)}

<div className="flex justify-end">

  <Button type="submit">
    Salvar Vistoria
  </Button>

</div>

</form>

);

}