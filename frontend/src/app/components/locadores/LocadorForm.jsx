"use client";

import { useEffect, useState } from "react";

import { CamposObrigatoriosService } from "@/services/camposObrigatorios.service";
import { obterCamposFaltando, mensagemCamposFaltando } from "@/utils/validacaoObrigatorios";
import { AsaasService } from "@/services/asaas.service";
import { usePermissao } from "@/hooks/usePermissao";

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

export default function LocadorForm({
  onSave,
  locadorEditando,
}) {

  const podeTestarAsaas = usePermissao("asaasConfig.testarConexao");
  const podeEditarAsaas = usePermissao("asaasConfig.editar");

  const [obrigatorios, setObrigatorios] = useState(new Set());

  const [erro, setErro] = useState("");

  const [testandoAsaas, setTestandoAsaas] = useState(false);
  const [mensagemAsaas, setMensagemAsaas] = useState(null);

  const [registrandoWebhook, setRegistrandoWebhook] = useState(false);

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

    observacoes: "",

    asaasToken: "",
    asaasWalletId: "",

  });

  useEffect(() => {

    if (!locadorEditando) return;

    setFormData({

      tipoPessoa:
        locadorEditando.tipoPessoa || "PF",

      nome:
        locadorEditando.nome || "",

      documento:
        locadorEditando.documento || "",

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

      observacoes:
        locadorEditando.observacoes || "",

      asaasToken:
        locadorEditando.asaasToken || "",

      asaasWalletId:
        locadorEditando.asaasWalletId || "",

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

  async function testarConexaoAsaas() {

    if (!locadorEditando) return;

    setTestandoAsaas(true);
    setMensagemAsaas(null);

    try {

      const resposta = await AsaasService.testarConexaoLocador(locadorEditando.id);
      const dados = resposta.data || resposta;

      setMensagemAsaas({
        tipo: dados.success ? "sucesso" : "erro",
        texto: dados.mensagem || (dados.success ? "Conexão realizada com sucesso." : "Não foi possível conectar."),
      });

    } catch (err) {

      setMensagemAsaas({ tipo: "erro", texto: err.message || "Não foi possível testar a conexão." });

    } finally {

      setTestandoAsaas(false);

    }

  }

  async function registrarWebhookAsaas() {

    if (!locadorEditando) return;

    setRegistrandoWebhook(true);
    setMensagemAsaas(null);

    try {

      const resposta = await AsaasService.registrarWebhookLocador(locadorEditando.id);
      const dados = resposta.data || resposta;

      setMensagemAsaas({
        tipo: dados.success ? "sucesso" : "erro",
        texto: dados.mensagem || (dados.success ? "Webhook registrado com sucesso." : "Não foi possível registrar o webhook."),
      });

    } catch (err) {

      setMensagemAsaas({ tipo: "erro", texto: err.message || "Não foi possível registrar o webhook." });

    } finally {

      setRegistrandoWebhook(false);

    }

  }

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

          <input

            name="nome"

            placeholder="Nome Completo"

            value={formData.nome}

            onChange={handleChange}

            className={inputStyle}

            required

          />

          <input

            name="documento"

            placeholder="CPF ou CNPJ"

            value={formData.documento}

            onChange={handleChange}

            className={inputStyle}

            required={true}

          />

          <input

            name="email"

            type="email"

            placeholder="E-mail"

            value={formData.email}

            onChange={handleChange}

            className={inputStyle}

            required={obrigatorios.has("email")}

          />

          <input

            name="telefone"

            placeholder="Telefone"

            value={formData.telefone}

            onChange={handleChange}

            className={inputStyle}

            required={obrigatorios.has("telefone")}

          />

        </div>

      </div>

      {/* Dados Bancários */}

      <div className="space-y-4">

        <h3 className="text-lg font-semibold text-[var(--text)]">

          Dados Bancários

        </h3>

        <div className="grid md:grid-cols-2 gap-6">

          <select

            name="banco"

            value={formData.banco}

            onChange={handleChange}

            className={inputStyle}

            required={obrigatorios.has("banco")}

          >

            <option
              value=""
              style={{
                backgroundColor: "#1d2833",
                color: "#ffffff",
              }}
            >
              Selecione um banco
            </option>

          <option
            value="001 - Banco do Brasil"
            style={{
              backgroundColor: "#1d2833",
              color: "#ffffff",
            }}
          >
            001 - Banco do Brasil
          </option>

          <option
            value="104 - Caixa Econômica Federal"
            style={{
              backgroundColor: "#1d2833",
              color: "#ffffff",
            }}
          >
            104 - Caixa Econômica Federal
          </option>

          <option
            value="237 - Bradesco"
            style={{
              backgroundColor: "#1d2833",
              color: "#ffffff",
            }}
          >
            237 - Bradesco
          </option>

          <option
            value="341 - Itaú"
            style={{
              backgroundColor: "#1d2833",
              color: "#ffffff",
            }}
          >
            341 - Itaú
          </option>

          <option
            value="033 - Santander"
            style={{
              backgroundColor: "#1d2833",
              color: "#ffffff",
            }}
          >
            033 - Santander
          </option>

          <option
            value="260 - Nubank"
            style={{
              backgroundColor: "#1d2833",
              color: "#ffffff",
            }}
          >
            260 - Nubank
          </option>

          <option
            value="077 - Inter"
            style={{
              backgroundColor: "#1d2833",
              color: "#ffffff",
            }}
          >
            077 - Inter
          </option>

          <option
            value="290 - PagBank"
            style={{
              backgroundColor: "#1d2833",
              color: "#ffffff",
            }}
          >
            290 - PagBank
          </option>

          <option
            value="323 - Mercado Pago"
            style={{
              backgroundColor: "#1d2833",
              color: "#ffffff",
            }}
          >
            323 - Mercado Pago
          </option>

          <option
            value="336 - C6 Bank"
            style={{
              backgroundColor: "#1d2833",
              color: "#ffffff",
            }}
          >
            336 - C6 Bank
          </option>

          <option
            value="756 - Sicoob"
            style={{
              backgroundColor: "#1d2833",
              color: "#ffffff",
            }}
          >
            756 - Sicoob
          </option>

          <option
            value="748 - Sicredi"
            style={{
              backgroundColor: "#1d2833",
              color: "#ffffff",
            }}
          >
            748 - Sicredi
          </option>
          </select>

                    <input
            name="agencia"
            placeholder="Agência"
            value={formData.agencia}
            onChange={handleChange}
            className={inputStyle}
            required={obrigatorios.has("agencia")}
          />

          <input
            name="conta"
            placeholder="Conta"
            value={formData.conta}
            onChange={handleChange}
            className={inputStyle}
            required={obrigatorios.has("conta")}
          />

          <input
            name="pix"
            placeholder="Chave PIX"
            value={formData.pix}
            onChange={handleChange}
            className={inputStyle}
            required={obrigatorios.has("pix")}
          />

        </div>

      </div>

      {/* Configurações Financeiras */}

      <div className="space-y-4">

        <h3 className="text-lg font-semibold text-[var(--text)]">

          Configurações Financeiras

        </h3>

        <div className="grid md:grid-cols-3 gap-6">

          <input
            name="taxaAdministracao"
            placeholder="Taxa Administração (%)"
            value={formData.taxaAdministracao}
            onChange={handleChange}
            className={inputStyle}
            required={obrigatorios.has("taxaAdministracao")}
          />

          <input
            name="multa"
            placeholder="Multa (%)"
            value={formData.multa}
            onChange={handleChange}
            className={inputStyle}
            required={obrigatorios.has("multa")}
          />

          <input
            name="juros"
            placeholder="Juros (%)"
            value={formData.juros}
            onChange={handleChange}
            className={inputStyle}
            required={obrigatorios.has("juros")}
          />

        </div>

      </div>

      {/* Conta Asaas própria */}

      <div className="space-y-4">

        <div>
          <h3 className="text-lg font-semibold text-[var(--text)]">
            Conta Asaas própria (opcional)
          </h3>
          <p className="text-sm text-[var(--text-subtle)] mt-1">
            Preencha só se este locador tiver a própria conta no Asaas e quiser que o
            aluguel dele caia direto lá. Deixe em branco para continuar usando a conta
            padrão do sistema (Configurações → Asaas).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <input
            name="asaasToken"
            type="password"
            placeholder="Token da API do Asaas"
            value={formData.asaasToken}
            onChange={handleChange}
            className={inputStyle}
            autoComplete="off"
          />

          <input
            name="asaasWalletId"
            placeholder="Wallet ID (opcional)"
            value={formData.asaasWalletId}
            onChange={handleChange}
            className={inputStyle}
          />

        </div>

        {locadorEditando && formData.asaasToken && (podeTestarAsaas || podeEditarAsaas) && (

          <div className="flex flex-wrap items-center gap-3">

            {podeTestarAsaas && (
              <button
                type="button"
                onClick={testarConexaoAsaas}
                disabled={testandoAsaas}
                className="
                  rounded-xl border border-[var(--border-token)]
                  bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text)]
                  hover:border-emerald-500/50 transition disabled:opacity-50
                "
              >
                {testandoAsaas ? "Testando..." : "Testar Conexão"}
              </button>
            )}

            {podeEditarAsaas && (
              <button
                type="button"
                onClick={registrarWebhookAsaas}
                disabled={registrandoWebhook}
                className="
                  rounded-xl border border-[var(--border-token)]
                  bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text)]
                  hover:border-emerald-500/50 transition disabled:opacity-50
                "
              >
                {registrandoWebhook ? "Registrando..." : "Registrar Webhook"}
              </button>
            )}

          </div>

        )}

        {mensagemAsaas && (
          <div
            className={`rounded-xl px-4 py-3 text-sm border ${
              mensagemAsaas.tipo === "sucesso"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            {mensagemAsaas.texto}
          </div>
        )}

      </div>

      {/* Observações */}

      <div className="space-y-4">

        <h3 className="text-lg font-semibold text-[var(--text)]">

          Observações

        </h3>

        <textarea
          name="observacoes"
          placeholder="Observações sobre o locador..."
          value={formData.observacoes}
          onChange={handleChange}
          className={`${inputStyle} min-h-[140px] resize-none`}
        />

      </div>

      {erro && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
          {erro}
        </div>
      )}

      {/* Rodapé */}

      <div
        className="
          flex
          justify-end

          border-t
          border-[var(--border-token)]

          pt-6
        "
      >

        <button
          type="submit"
          className="
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