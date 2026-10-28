"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, X, Camera } from "lucide-react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

import { CamposObrigatoriosService } from "../../../services/camposObrigatorios.service";
import { obterCamposFaltando, mensagemCamposFaltando } from "../../../utils/validacaoObrigatorios";
import { lerArquivoComoDataUrl } from "../../../utils/arquivoMidia";

const CAMPOS = ["titulo", "descricao", "prazo", "observacoes"];

const ROTULOS = {
  titulo: "Título",
  descricao: "Descrição",
  prazo: "Prazo",
  observacoes: "Observações",
};

export default function SolicitacaoForm({
  onSave,
  onCancelar,
  solicitacaoEditando,
}) {

  const [obrigatorios, setObrigatorios] = useState(new Set());

  const [erro, setErro] = useState("");

  useEffect(() => {

    async function carregarObrigatorios() {

      try {

        const resposta = await CamposObrigatoriosService.listar("solicitacao");
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

  const [form, setForm] = useState({

    numero: "",
    titulo: "",
    descricao: "",
    prazo: "",
    observacoes: "",

  });

  const [anexo, setAnexo] = useState(null);

  const inputArquivoRef = useRef(null);
  const inputCameraRef = useRef(null);

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

    const faltando = obterCamposFaltando(CAMPOS, form, obrigatorios, ROTULOS);

    if (faltando.length > 0) {
      setErro(mensagemCamposFaltando(faltando));
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
          Título{obrigatorios.has("titulo") && <span className="text-red-400"> *</span>}
        </label>

        <Input
          name="titulo"
          value={form.titulo}
          onChange={alterarCampo}
          placeholder="Ex.: Troca de chuveiro"
          className={input}
          required={obrigatorios.has("titulo")}
        />

      </div>

      <div>

        <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
          Descrição{obrigatorios.has("descricao") && <span className="text-red-400"> *</span>}
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
          required={obrigatorios.has("descricao")}
        />

      </div>

      <div>

        <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
          Prazo{obrigatorios.has("prazo") && <span className="text-red-400"> *</span>}
        </label>

        <Input
          type="date"
          name="prazo"
          value={form.prazo}
          onChange={alterarCampo}
          className={input}
          required={obrigatorios.has("prazo")}
        />

      </div>

      <div>

        <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
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

        <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
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
              onClick={() => inputCameraRef.current?.click()}
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
              Anexar arquivo (imagem, PDF, etc.)
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
          onChange={selecionarArquivo}
          className="hidden"
        />

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
          {solicitacaoEditando
            ? "Salvar Alterações"
            : "Salvar Solicitação"}
        </Button>

      </div>

    </form>

  );

}
