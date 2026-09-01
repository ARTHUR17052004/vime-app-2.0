"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";

const CATEGORIAS = ["Bug", "Dúvida", "Sugestão", "Outro"];
const CRITICIDADES = ["Baixa", "Média", "Alta", "Urgente"];

export default function ChamadoForm({
  onSave,
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

  function selecionarArquivo(e) {

    const arquivo = e.target.files?.[0];

    if (!arquivo) return;

    if (arquivo.size > 8 * 1024 * 1024) {
      alert("Arquivo muito grande (máximo 8 MB) -- vídeos grandes não cabem aqui, tente um print ou um vídeo curto.");
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {

      setAnexo({
        nome: arquivo.name,
        tipo: arquivo.type || "application/octet-stream",
        dados: leitor.result,
      });

    };

    leitor.readAsDataURL(arquivo);

  }

  function removerArquivo() {

    setAnexo(null);

    if (inputArquivoRef.current) {
      inputArquivoRef.current.value = "";
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

          <button
            type="button"
            onClick={() => inputArquivoRef.current?.click()}
            className="
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
            Anexar print ou vídeo curto (até 8 MB)
          </button>

        )}

        <input
          ref={inputArquivoRef}
          type="file"
          accept="image/*,video/*"
          onChange={selecionarArquivo}
          className="hidden"
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

      <div className="flex justify-end pt-2">

        <Button type="submit">
          {chamadoEditando
            ? "Salvar Alterações"
            : "Abrir Chamado"}
        </Button>

      </div>

    </form>

  );

}
