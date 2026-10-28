"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, X, Camera } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import CameraCapture, { cameraSuportada } from "../ui/CameraCapture";

import { lerArquivoComoDataUrl, LIMITE_MIDIA_MB } from "@/utils/arquivoMidia";

const CATEGORIAS = ["Bug", "Dúvida", "Sugestão", "Outro"];
const CRITICIDADES = ["Baixa", "Média", "Alta", "Urgente"];

export default function ChamadoForm({
  onSave,
  onCancelar,
  chamadoEditando,
}) {

  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    numero: "",
    titulo: "",
    descricao: "",
    categoria: "Bug",
    criticidade: "Média",
  });

  const [anexo, setAnexo] = useState(null);

  const inputArquivoRef = useRef(null);
  const inputCameraRef = useRef(null);
  const [cameraAberta, setCameraAberta] = useState(false);

  useEffect(() => {

    if (chamadoEditando) {

      setForm({
        numero: chamadoEditando.numero || "",
        titulo: chamadoEditando.titulo || "",
        descricao: chamadoEditando.descricao || "",
        categoria: chamadoEditando.categoria || "Bug",
        criticidade: chamadoEditando.criticidade || "Média",
      });

      return;

    }

    setForm({
      numero: `CH-${Date.now().toString().slice(-6)}`,
      titulo: "",
      descricao: "",
      categoria: "Bug",
      criticidade: "Média",
    });

    setAnexo(null);

  }, [chamadoEditando]);

  function alterarCampo(e) {
    setErro("");
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function selecionarArquivo(e) {

    const arquivo = e.target.files?.[0];
    e.target.value = "";

    if (!arquivo) return;

    try {

      const dados = await lerArquivoComoDataUrl(arquivo);

      setAnexo({
        nome: arquivo.name,
        tipo: arquivo.type || "application/octet-stream",
        dados,
      });

    } catch (erro) {

      alert(erro.message);

    }

  }

  function abrirCamera() {
    if (cameraSuportada()) {
      setCameraAberta(true);
    } else {
      inputCameraRef.current?.click();
    }
  }

  function aoCapturarFoto(arquivo) {
    setCameraAberta(false);
    selecionarArquivo({ target: { files: [arquivo], value: "" } });
  }

  function removerArquivo() {

    setAnexo(null);

    if (inputArquivoRef.current) {
      inputArquivoRef.current.value = "";
    }

    if (inputCameraRef.current) {
      inputCameraRef.current.value = "";
    }

  }

  function salvar(e) {

    e.preventDefault();

    if (!form.titulo.trim()) {
      setErro("Título é obrigatório.");
      return;
    }

    setErro("");

    onSave({
      ...form,
      anexo,
    });

  }

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
      onSubmit={salvar}
      noValidate
      className="space-y-8"
    >

      <div>

        <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
          Número
        </label>

        <Input
          readOnly
          name="numero"
          value={form.numero}
          className={`${input} bg-[var(--surface-3)]`}
        />

      </div>

      <div>

        <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
          Título <span className="text-red-400">*</span>
        </label>

        <Input
          name="titulo"
          value={form.titulo}
          onChange={alterarCampo}
          placeholder="Resuma o problema em poucas palavras"
          className={input}
          required
        />

      </div>

      <div className="grid sm:grid-cols-2 gap-6">

        <Select
          label="Categoria"
          name="categoria"
          value={form.categoria}
          onChange={alterarCampo}
          options={CATEGORIAS.map((c) => ({ label: c, value: c }))}
        />

        <Select
          label="Criticidade"
          name="criticidade"
          value={form.criticidade}
          onChange={alterarCampo}
          options={CRITICIDADES.map((c) => ({ label: c, value: c }))}
        />

      </div>

      <div>

        <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
          Descreva o problema
        </label>

        <Textarea
          rows={6}
          name="descricao"
          value={form.descricao}
          onChange={alterarCampo}
          placeholder="O que você estava fazendo, o que esperava que acontecesse e o que aconteceu de errado..."
          className={`
            ${input}
            min-h-[160px]
            resize-none
          `}
        />

      </div>

      <div>

        <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
          Print ou vídeo (opcional)
        </label>

        {anexo ? (

          <div
            className="
              flex
              items-center
              justify-between
              rounded-xl
              border
              border-[var(--border-token)]
              bg-[var(--surface-2)]
              px-4
              py-3
            "
          >

            <span className="text-sm text-[var(--text-muted)] truncate">
              📎 {anexo.nome}
            </span>

            <button
              type="button"
              onClick={removerArquivo}
              className="text-[var(--text-subtle)] hover:text-red-400 transition"
            >
              <X size={18} />
            </button>

          </div>

        ) : (

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={abrirCamera}
              title="Tirar foto"
              className="
                flex
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                border-[var(--border-token)]
                bg-[var(--surface-2)]
                px-4
                py-3
                text-[var(--text-subtle)]
                hover:bg-[var(--surface-3)]
                hover:text-[var(--text-1)]
                transition
              "
            >
              <Camera size={16} />
            </button>

            <button
              type="button"
              onClick={() => inputArquivoRef.current?.click()}
              className="
                flex-1
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-dashed
                border-[var(--border-token)]
                bg-[var(--surface-2)]
                px-4
                py-3
                text-sm
                text-[var(--text-subtle)]
                hover:bg-[var(--surface-3)]
                hover:text-[var(--text-1)]
                transition
              "
            >
              <Paperclip size={16} />
              Anexar print ou vídeo (até {LIMITE_MIDIA_MB} MB)
            </button>

          </div>

        )}

        <input
          ref={inputCameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={selecionarArquivo}
          className="hidden"
        />

        <input
          ref={inputArquivoRef}
          type="file"
          accept="image/*,video/*"
          onChange={selecionarArquivo}
          className="hidden"
        />

        <CameraCapture
          aberto={cameraAberta}
          onFechar={() => setCameraAberta(false)}
          onCapturar={aoCapturarFoto}
        />

        <p className="mt-2 text-xs text-[var(--text-faint)]">
          Dá pra anexar mais prints e vídeos depois, direto na conversa do chamado.
        </p>

      </div>

      {erro && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
          {erro}
        </div>
      )}

      {/* Fixo embaixo do modal (não rola junto com o formulário) --
          padrão do sistema no mobile: botão de enviar sempre visível,
          com Cancelar logo abaixo dele. */}
      <div
        className="
          sticky bottom-0 -mx-8 -mb-8 mt-6
          flex flex-col-reverse sm:flex-row sm:justify-end
          gap-3
          border-t border-[var(--border-token)]
          bg-[var(--surface)]
          px-8 py-5
        "
      >

        {onCancelar && (
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onCancelar}>
            Cancelar
          </Button>
        )}

        <Button type="submit" className="w-full sm:w-auto">
          {chamadoEditando
            ? "Salvar Alterações"
            : "Abrir Chamado"}
        </Button>

      </div>

    </form>

  );

}
