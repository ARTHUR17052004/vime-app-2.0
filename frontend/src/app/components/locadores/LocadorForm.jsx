"use client";

import { useEffect, useState } from "react";

export default function LocadorForm({
  onSave,
  locadorEditando,
}) {

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

    });

  }, [locadorEditando]);

  function handleChange(e) {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  }

  function handleSubmit(e) {

    e.preventDefault();

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

            required

          />

          <input

            name="email"

            type="email"

            placeholder="E-mail"

            value={formData.email}

            onChange={handleChange}

            className={inputStyle}

          />

          <input

            name="telefone"

            placeholder="Telefone"

            value={formData.telefone}

            onChange={handleChange}

            className={inputStyle}

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
          />

          <input
            name="conta"
            placeholder="Conta"
            value={formData.conta}
            onChange={handleChange}
            className={inputStyle}
          />

          <input
            name="pix"
            placeholder="Chave PIX"
            value={formData.pix}
            onChange={handleChange}
            className={inputStyle}
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
          />

          <input
            name="multa"
            placeholder="Multa (%)"
            value={formData.multa}
            onChange={handleChange}
            className={inputStyle}
          />

          <input
            name="juros"
            placeholder="Juros (%)"
            value={formData.juros}
            onChange={handleChange}
            className={inputStyle}
          />

        </div>

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