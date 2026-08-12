"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

export default function SolicitacaoForm({
  onSave,
  solicitacaoEditando,
}) {

  const [form, setForm] = useState({

    numero: "",
    titulo: "",
    descricao: "",
    prazo: "",
    observacoes: "",

  });

  const [anexo, setAnexo] = useState(null);

  const inputArquivoRef = useRef(null);

  useEffect(() => {

    if (solicitacaoEditando) {

      setForm({

        numero: solicitacaoEditando.numero || "",

        titulo: solicitacaoEditando.titulo || "",

        descricao: solicitacaoEditando.descricao || "",

        prazo: solicitacaoEditando.prazo
          ? new Date(solicitacaoEditando.prazo)
              .toISOString()
              .split("T")[0]
          : "",

        observacoes: solicitacaoEditando.observacoes || "",

      });

      return;

    }

    setForm({

      numero: `SOL-${Date.now().toString().slice(-6)}`,

      titulo: "",

      descricao: "",

      prazo: "",

      observacoes: "",

    });

    setAnexo(null);

  }, [solicitacaoEditando]);

  function alterarCampo(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function selecionarArquivo(e) {

    const arquivo = e.target.files?.[0];

    if (!arquivo) return;

    if (arquivo.size > 8 * 1024 * 1024) {
      alert("Arquivo muito grande (máximo 8 MB).");
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

    onSave({
      ...form,
      anexo,
    });

  }

  const input = `
    w-full
    rounded-xl
    border
    border-white/10
    bg-white/5
    px-4
    py-3
    text-white
    placeholder:text-gray-500
    outline-none
    focus:border-emerald-500
  `;

  return (

    <form
      onSubmit={salvar}
      className="space-y-8"
    >

      <div>

        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Número
        </label>

        <Input
          readOnly
          name="numero"
          value={form.numero}
          className={`${input} bg-white/10`}
        />

      </div>

      <div>

        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Título
        </label>

        <Input
          name="titulo"
          value={form.titulo}
          onChange={alterarCampo}
          placeholder="Ex.: Troca de chuveiro"
          className={input}
        />

      </div>

      <div>

        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Descrição
        </label>

        <Textarea
          rows={6}
          name="descricao"
          value={form.descricao}
          onChange={alterarCampo}
          placeholder="Descreva detalhadamente a solicitação..."
          className={`
            ${input}
            min-h-[160px]
            resize-none
          `}
        />

      </div>

      <div>

        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Prazo
        </label>

        <Input
          type="date"
          name="prazo"
          value={form.prazo}
          onChange={alterarCampo}
          className={input}
        />

      </div>

      <div>

        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Observações
        </label>

        <Textarea
          rows={4}
          name="observacoes"
          value={form.observacoes}
          onChange={alterarCampo}
          placeholder="Informações adicionais (opcional)..."
          className={`
            ${input}
            min-h-[120px]
            resize-none
          `}
        />

      </div>

      <div>

        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Anexo
        </label>

        {anexo ? (

          <div
            className="
              flex
              items-center
              justify-between
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-3
            "
          >

            <span className="text-sm text-gray-300 truncate">
              📎 {anexo.nome}
            </span>

            <button
              type="button"
              onClick={removerArquivo}
              className="text-gray-400 hover:text-red-400 transition"
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
              border-white/15
              bg-white/5
              px-4
              py-3
              text-sm
              text-gray-400
              hover:bg-white/10
              hover:text-gray-200
              transition
            "
          >
            <Paperclip size={16} />
            Anexar arquivo (imagem, PDF, etc.)
          </button>

        )}

        <input
          ref={inputArquivoRef}
          type="file"
          onChange={selecionarArquivo}
          className="hidden"
        />

      </div>

      <div className="flex justify-end pt-2">

        <Button type="submit">
          {solicitacaoEditando
            ? "Salvar Alterações"
            : "Salvar Solicitação"}
        </Button>

      </div>

    </form>

  );

}
