"use client";

import { useEffect, useState } from "react";

import { CamposObrigatoriosService } from "@/services/camposObrigatorios.service";
import { obterCamposFaltando, mensagemCamposFaltando } from "@/utils/validacaoObrigatorios";
import { validarTelefone, validarDocumento } from "@/utils/validadores";
import SeletorBusca from "../ui/SeletorBusca";

// Dados bancários do locador (informativo, pra referência -- não é a
// mesma coisa que a conta de pagamento/gateway cadastrada em "Contas").
const BANCOS = [
  { value: "Asaas", label: "Asaas" },
  { value: "001 - Banco do Brasil", label: "001 - Banco do Brasil" },
  { value: "104 - Caixa Econômica Federal", label: "104 - Caixa Econômica Federal" },
  { value: "237 - Bradesco", label: "237 - Bradesco" },
  { value: "341 - Itaú", label: "341 - Itaú" },
  { value: "033 - Santander", label: "033 - Santander" },
  { value: "260 - Nubank", label: "260 - Nubank" },
  { value: "077 - Inter", label: "077 - Inter" },
  { value: "290 - PagBank", label: "290 - PagBank" },
  { value: "323 - Mercado Pago", label: "323 - Mercado Pago" },
  { value: "336 - C6 Bank", label: "336 - C6 Bank" },
  { value: "364 - Efí", label: "364 - Efí" },
  { value: "756 - Sicoob", label: "756 - Sicoob" },
  { value: "748 - Sicredi", label: "748 - Sicredi" },
];

const CAMPOS = [
  "nome", "documento", "email", "telefone", "banco", "agencia", "conta", "pix",
  "taxaAdministracao", "multa", "juros", "observacoes",
];

const SEMPRE_OBRIGATORIOS = new Set(["nome", "documento"]);

const ROTULOS = {
  nome: "Nome Completo",
  documento: "CPF/CNPJ",
  email: "E-mail",
  telefone: "Telefone",
  banco: "Banco",
  agencia: "Agência",
  conta: "Conta",
  pix: "Chave PIX",
  taxaAdministracao: "Taxa de Administração",
  multa: "Multa",
  juros: "Juros",
  observacoes: "Observações",
};

function Campo({ label, obrigatorio, children }) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-subtle)] mb-1.5">
        {label}
        {obrigatorio && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function LocadorForm({
  onSave,
  onCancelar,
  locadorEditando,
}) {

  const [obrigatorios, setObrigatorios] = useState(new Set());

  const [erro, setErro] = useState("");

  useEffect(() => {

    async function carregarObrigatorios() {

      try {

        const resposta = await CamposObrigatoriosService.listar("locador");
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

  const [formData, setFormData] = useState({

    tipoPessoa: "PF",

    nome: "",
    documento: "",
    email: "",
    telefone: "",

    banco: "",
    agencia: "",
    conta: "",
    pix: "",

    taxaAdministracao: "",
    multa: "",
    juros: "",
    diaVencimentoPadrao: "",

    observacoes: "",

  });

  useEffect(() => {

    if (!locadorEditando) return;

    setFormData({

      tipoPessoa:
        locadorEditando.tipoPessoa || "PF",

      nome:
        locadorEditando.nome || "",

      documento:
        locadorEditando.documento || locadorEditando.cpfCnpj || "",

      email:
        locadorEditando.email || "",

      telefone:
        locadorEditando.telefone || "",

      banco:
        locadorEditando.banco || "",

      agencia:
        locadorEditando.agencia || "",

      conta:
        locadorEditando.conta || "",

      pix:
        locadorEditando.pix || "",

      taxaAdministracao:
        locadorEditando.taxaAdministracao || "",

      multa:
        locadorEditando.multa || "",

      juros:
        locadorEditando.juros || "",

      diaVencimentoPadrao:
        locadorEditando.diaVencimentoPadrao != null
          ? String(locadorEditando.diaVencimentoPadrao)
          : "",

      observacoes:
        locadorEditando.observacoes || "",

    });

  }, [locadorEditando]);

  function handleChange(e) {

    const { name, value } = e.target;

    setErro("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  }

  const documentoInvalido = !!formData.documento && !validarDocumento(formData.documento);
  const telefoneInvalido = !!formData.telefone && !validarTelefone(formData.telefone);

  function handleSubmit(e) {

    e.preventDefault();

    const exigidos = new Set([...obrigatorios, ...SEMPRE_OBRIGATORIOS]);

    const faltando = obterCamposFaltando(CAMPOS, formData, exigidos, ROTULOS);

    if (faltando.length > 0) {
      setErro(mensagemCamposFaltando(faltando));
      return;
    }

    setErro("");

    onSave(formData);

  }

  const inputStyle = `

    w-full

    rounded-2xl

    border
    border-[var(--border-token)]

    bg-[var(--surface-2)]

    backdrop-blur

    px-4
    py-3

    text-[var(--text)]

    placeholder:text-[var(--text-subtle)]

    transition-all

    focus:outline-none

    focus:border-emerald-500

    focus:ring-2
    focus:ring-emerald-500/20

  `;

  return (

    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
    >

      {/* Cabeçalho */}

      <div className="space-y-2">

        <h2 className="text-3xl font-bold text-[var(--text)]">

          {

            locadorEditando

              ? "Editar Locador"

              : "Cadastro de Locador"

          }

        </h2>

        <p className="text-[var(--text-subtle)]">

          Dados do proprietário

        </p>

      </div>

      {/* Dados Básicos */}

      <div className="space-y-4">

        <h3 className="text-lg font-semibold text-[var(--text)]">

          Informações Gerais

        </h3>

        <div className="grid md:grid-cols-2 gap-6">

          <select
            name="tipoPessoa"
            value={formData.tipoPessoa}
            onChange={handleChange}
            className={inputStyle}
          >
            <option
              value="PF"
              style={{
                backgroundColor: "#1d2833",
                color: "#ffffff",
              }}
            >
              Pessoa Física
            </option>

            <option
              value="PJ"
              style={{
                backgroundColor: "#1d2833",
                color: "#ffffff",
              }}
            >
              Pessoa Jurídica
            </option>
          </select>

          <Campo label="Nome Completo" obrigatorio>
            <input
              name="nome"
              placeholder="Nome Completo"
              value={formData.nome}
              onChange={handleChange}
              className={inputStyle}
              required
            />
          </Campo>

          <Campo label="CPF/CNPJ" obrigatorio>
            <input
              name="documento"
              placeholder="CPF ou CNPJ"
              value={formData.documento}
              onChange={handleChange}
              className={`${inputStyle} ${
                documentoInvalido ? "border-red-500/60 focus:border-red-500" : ""
              }`}
              required
            />

            {documentoInvalido && (
              <p className="mt-1.5 text-xs text-red-400">
                CPF/CNPJ inválido. Digite "SN" se não tiver.
              </p>
            )}
          </Campo>

          <Campo label="E-mail" obrigatorio={obrigatorios.has("email")}>
            <input
              name="email"
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              className={inputStyle}
              required={obrigatorios.has("email")}
            />
          </Campo>

          <Campo label="Telefone" obrigatorio={obrigatorios.has("telefone")}>
            <input
              name="telefone"
              placeholder="Telefone"
              value={formData.telefone}
              onChange={handleChange}
              className={`${inputStyle} ${
                telefoneInvalido ? "border-red-500/60 focus:border-red-500" : ""
              }`}
              required={obrigatorios.has("telefone")}
            />

            {telefoneInvalido && (
              <p className="mt-1.5 text-xs text-red-400">
                Telefone inválido. Digite "SN" se não tiver.
              </p>
            )}
          </Campo>

        </div>

      </div>

      {/* Dados Bancários */}

      <div className="space-y-4">

        <h3 className="text-lg font-semibold text-[var(--text)]">

          Dados Bancários

        </h3>

        <div className="grid md:grid-cols-2 gap-6">

          <Campo label="Banco" obrigatorio={obrigatorios.has("banco")}>
            <SeletorBusca
              opcoes={BANCOS}
              value={formData.banco}
              onChange={(valor) => {
                setErro("");
                setFormData((prev) => ({ ...prev, banco: valor }));
              }}
              placeholder="Selecione um banco"
              className={inputStyle}
              required={obrigatorios.has("banco")}
            />
          </Campo>

          <Campo label="Agência" obrigatorio={obrigatorios.has("agencia")}>
            <input
              name="agencia"
              placeholder="Agência"
              value={formData.agencia}
              onChange={handleChange}
              className={inputStyle}
              required={obrigatorios.has("agencia")}
            />
          </Campo>

          <Campo label="Conta" obrigatorio={obrigatorios.has("conta")}>
            <input
              name="conta"
              placeholder="Conta"
              value={formData.conta}
              onChange={handleChange}
              className={inputStyle}
              required={obrigatorios.has("conta")}
            />
          </Campo>

          <Campo label="Chave PIX" obrigatorio={obrigatorios.has("pix")}>
            <input
              name="pix"
              placeholder="Chave PIX"
              value={formData.pix}
              onChange={handleChange}
              className={inputStyle}
              required={obrigatorios.has("pix")}
            />
          </Campo>

        </div>

      </div>

      {/* Configurações Financeiras */}

      <div className="space-y-4">

        <h3 className="text-lg font-semibold text-[var(--text)]">

          Configurações Financeiras

        </h3>

        <div className="grid md:grid-cols-3 gap-6">

          <Campo label="Taxa de Administração (%)" obrigatorio={obrigatorios.has("taxaAdministracao")}>
            <input
              name="taxaAdministracao"
              placeholder="Taxa Administração (%)"
              value={formData.taxaAdministracao}
              onChange={handleChange}
              className={inputStyle}
              required={obrigatorios.has("taxaAdministracao")}
            />
          </Campo>

          <Campo label="Multa (%)" obrigatorio={obrigatorios.has("multa")}>
            <input
              name="multa"
              placeholder="Multa (%)"
              value={formData.multa}
              onChange={handleChange}
              className={inputStyle}
              required={obrigatorios.has("multa")}
            />
          </Campo>

          <Campo label="Juros (%)" obrigatorio={obrigatorios.has("juros")}>
            <input
              name="juros"
              placeholder="Juros (%)"
              value={formData.juros}
              onChange={handleChange}
              className={inputStyle}
              required={obrigatorios.has("juros")}
            />
          </Campo>

          <Campo label="Dia de Vencimento Padrão">
            <input
              name="diaVencimentoPadrao"
              placeholder="Em branco = dia do cadastro"
              value={formData.diaVencimentoPadrao}
              onChange={handleChange}
              className={inputStyle}
            />
          </Campo>

        </div>

        <p className="text-sm text-[var(--text-subtle)]">
          Preenche automaticamente o "Dia de Vencimento" de toda Residência
          nova cadastrada pra este locador. Deixe em branco pra cada contrato
          vencer sempre no dia em que foi cadastrado (cobrança espalhada ao
          longo do mês); preencha com um número fixo (ex.: 1) pra todo mundo
          vencer sempre nesse dia do mês.
        </p>

      </div>

      {/* Observações */}

      <div className="space-y-4">

        <h3 className="text-lg font-semibold text-[var(--text)]">

          Observações

        </h3>

        <Campo label="Observações" obrigatorio={obrigatorios.has("observacoes")}>
          <textarea
            name="observacoes"
            placeholder="Observações sobre o locador..."
            value={formData.observacoes}
            onChange={handleChange}
            className={`${inputStyle} min-h-[140px] resize-none`}
            required={obrigatorios.has("observacoes")}
          />
        </Campo>

      </div>

      {erro && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
          {erro}
        </div>
      )}

      {/* Rodapé */}

      <div
        className="
          sticky bottom-0 -mx-8 -mb-8 mt-4
          flex flex-col-reverse sm:flex-row sm:justify-end
          gap-3

          border-t
          border-[var(--border-token)]
          bg-[var(--surface)]

          px-8 py-5
        "
      >

        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="
              w-full sm:w-auto
              rounded-2xl
              border
              border-[var(--border-token)]
              bg-[var(--surface-2)]
              px-8
              py-3
              font-semibold
              text-[var(--text)]
              transition-all
              hover:bg-[var(--surface-3)]
            "
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          className="
            w-full sm:w-auto
            rounded-2xl

            bg-emerald-600

            px-8
            py-3

            font-semibold
            text-[var(--text)]

            transition-all

            hover:bg-emerald-700

            hover:shadow-xl
          "
        >

          {locadorEditando

            ? "Salvar Alterações"

            : "Salvar Locador"

          }

        </button>

      </div>

    </form>

  );

}