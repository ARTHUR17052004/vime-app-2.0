"use client";

import { useEffect, useState } from "react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";

import { UnidadeService } from "@/services/unidades.service";
import { KitnetService } from "@/services/kitnets.service";
import { UsuarioService } from "@/services/usuarios.service";
import { CamposObrigatoriosService } from "@/services/camposObrigatorios.service";
import { obterCamposFaltando, mensagemCamposFaltando } from "@/utils/validacaoObrigatorios";
import { lerArquivoComoDataUrl, tamanhoTotalMB } from "@/utils/arquivoMidia";
import { ordenarPorNumero } from "@/utils/ordenarKitnets";
import { avancarUmaVez } from "@/utils/periodicidade";

// Sentinela só de UI pra "vale pra todas as kitnets desta residência"
// (ex.: vistoria de limpeza das áreas comuns da VIME I inteira) -- vira
// kitnetId null de verdade antes de enviar pro backend (que já aceita
// null nesse campo).
const GERAL = "GERAL";

// "Nome da Vistoria" é sempre exigido -- vira a coluna "titulo" no
// banco, que não aceita nulo, independente do que for configurado em
// Campos Obrigatórios.
const SEMPRE_OBRIGATORIOS = new Set(["nomeVistoria"]);

const CAMPOS = [
  "nomeVistoria", "unidadeId", "kitnetId", "categoria",
  "periodicidade", "responsavel", "dataProxima", "observacoes",
];

const ROTULOS = {
  nomeVistoria: "Nome da Vistoria",
  unidadeId: "Residência",
  kitnetId: "Kitnet",
  categoria: "Categoria",
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
  const [zeladores, setZeladores] = useState([]);

  const [obrigatorios, setObrigatorios] = useState(new Set());
  const [erro, setErro] = useState("");

  const [formData, setFormData] = useState({
    unidadeId: "",
    kitnetId: "",

    nomeVistoria: "",

    categoria: "Preventiva",

    periodicidade: "Mensal",

    responsavel: "",

    dataUltima: "",

    dataProxima: "",

    status: "PROGRAMADA",

    observacoes: "",

    fotos: [],
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

    async function carregarZeladores() {

      try {

        const resposta = await UsuarioService.listarZeladores();

        setZeladores(
          Array.isArray(resposta) ? resposta : resposta.data || []
        );

      } catch (err) {

        console.error("Erro ao carregar zeladores:", err);

      }

    }

    carregarZeladores();

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

      // null = "Geral" (residência inteira, ou -- se unidadeId também
      // for null -- o sistema inteiro) -- sem isso os selects ficavam
      // sem nada marcado ao editar uma vistoria assim, parecendo que
      // esqueceram de escolher.
      setFormData({
        ...formData,
        ...vistoriaEditando,
        unidadeId: vistoriaEditando.unidadeId || GERAL,
        kitnetId: vistoriaEditando.kitnetId || GERAL,
      });

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vistoriaEditando]);

  // Data Próxima é calculada sozinha a partir da Data Última + 1 passo
  // da periodicidade (sem Data Última ainda, usa hoje como base) --
  // "Única" não repete, então não tem próxima data.
  useEffect(() => {

    const base = formData.dataUltima ? new Date(`${formData.dataUltima}T00:00:00`) : new Date();
    const proxima = avancarUmaVez(base, formData.periodicidade);

    setFormData((prev) => ({
      ...prev,
      dataProxima: proxima ? proxima.toISOString().split("T")[0] : "",
    }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.dataUltima, formData.periodicidade]);

  const handleChange = (e) => {

    const { name, value } = e.target;

    if (name === "unidadeId") {

      setFormData((prev) => ({
        ...prev,
        unidadeId: value,
        // Geral em Residência já é "todas as kitnets de todas as
        // residências" -- não faz sentido escolher uma kitnet depois.
        kitnetId: value === GERAL ? GERAL : "",
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

    onSave({
      ...formData,
      unidadeId: formData.unidadeId === GERAL ? null : formData.unidadeId,
      kitnetId: formData.kitnetId === GERAL ? null : formData.kitnetId,
    });

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

            <option value={GERAL} style={{ backgroundColor: "#1d2833", color: "#fff" }}>
              🏢 Geral -- todas as residências
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
            disabled={formData.unidadeId === GERAL}
            className={input}
          >
            {formData.unidadeId === GERAL ? (
              <option value={GERAL} style={{ backgroundColor: "#1d2833", color: "#fff" }}>
                🏢 Geral -- todas as kitnets de todas as residências
              </option>
            ) : (
              <>
                <option value="" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
                  Selecione...
                </option>

                <option value={GERAL} style={{ backgroundColor: "#1d2833", color: "#fff" }}>
                  🏢 Geral -- todas as kitnets desta residência
                </option>
              </>
            )}

            {ordenarPorNumero(kitnets).map((kitnet) => (
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

            <option>Única</option>
            <option>Diária</option>
            <option>Semanal</option>
            <option>Quinzenal</option>
            <option>Mensal</option>
            <option>Bimestral</option>
            <option>Trimestral</option>
            <option>Semestral</option>
            <option>Anual</option>

          </Select>

          <p className="mt-1.5 text-xs text-[var(--text-faint)]">
            "Única" não se repete. As demais renovam sozinhas ao concluir --
            já marcam a próxima data automaticamente.
          </p>

        </div>

        <div>

          <label className="font-semibold text-[var(--text-muted)]">
            Responsável (Zelador)
            {obrigatorios.has("responsavel") && <span className="ml-1 text-red-400">*</span>}
          </label>

          {/* Quem cria (Operador, Gerência...) não é quem executa --
              só escolhe entre os zeladores cadastrados, sem digitar
              nome nenhum. */}
          <Select
            name="responsavel"
            value={formData.responsavel}
            onChange={handleChange}
            required={obrigatorios.has("responsavel")}
            className={input}
          >
            <option value="" style={{ backgroundColor: "#1d2833", color: "#fff" }}>
              Selecione um zelador...
            </option>

            {zeladores.map((zelador) => (
              <option
                key={zelador.id}
                value={zelador.nome}
                style={{ backgroundColor: "#1d2833", color: "#fff" }}
              >
                {zelador.nome}
              </option>
            ))}
          </Select>

          {zeladores.length === 0 && (
            <p className="mt-1.5 text-xs text-[var(--text-faint)]">
              Nenhum usuário com perfil Zelador cadastrado ainda.
            </p>
          )}

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
      disabled
      className={`${input} opacity-70 cursor-not-allowed`}
    />

    <p className="mt-1.5 text-xs text-[var(--text-faint)]">
      {formData.periodicidade === "Única"
        ? "Calculada automaticamente -- \"Única\" não se repete."
        : "Calculada automaticamente a partir da Data Última + Periodicidade."}
    </p>

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

  <label className="font-bold text-[var(--text-muted)] text-lg block mb-4">
    Fotos e Vídeos da Vistoria
  </label>

  <Input
    type="file"
    multiple
    accept="image/*,video/*"
    className={input}
    onChange={async (e) => {

      const arquivos = Array.from(
        e.target.files || []
      );

      e.target.value = "";

      // Um de cada vez (não em paralelo) pra somar o total certo --
      // senão vários arquivos grandes escolhidos juntos passariam cada
      // um na checagem individual e só estourariam o limite do
      // backend depois, todos juntos no mesmo envio. O total roda numa
      // variável local (não no estado do React, que só atualiza de
      // verdade depois do fim desta função).
      let totalAtualMB = tamanhoTotalMB(formData.fotos);

      for (const arquivo of arquivos) {

        try {
          const dataUrl = await lerArquivoComoDataUrl(arquivo, { totalAtualMB });
          totalAtualMB += arquivo.size / 1024 / 1024;

          setFormData((prev) => ({
            ...prev,
            fotos: [...(prev.fotos || []), dataUrl],
          }));
        } catch (erro) {
          setErro(erro.message);
          break;
        }

      }

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