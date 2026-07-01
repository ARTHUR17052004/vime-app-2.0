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
    if (locadorEditando) {
      setFormData({
        tipoPessoa:
          locadorEditando.tipoPessoa || "PF",

        nome: locadorEditando.nome || "",
        documento:
          locadorEditando.documento || "",
        email: locadorEditando.email || "",
        telefone:
          locadorEditando.telefone || "",

        banco: locadorEditando.banco || "",
        agencia:
          locadorEditando.agencia || "",
        conta: locadorEditando.conta || "",
        pix: locadorEditando.pix || "",

        taxaAdministracao:
          locadorEditando.taxaAdministracao ||
          "",

        multa: locadorEditando.multa || "",

        juros: locadorEditando.juros || "",

        observacoes:
          locadorEditando.observacoes || "",
      });
    }
  }, [locadorEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave(formData);
  };

  const inputStyle =
    "border border-gray-300 rounded-xl p-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {locadorEditando
            ? "Editar Locador"
            : "Cadastro de Locador"}
        </h2>

        <p className="text-gray-500 mt-1">
          Dados do proprietário
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <select
          name="tipoPessoa"
          value={formData.tipoPessoa}
          onChange={handleChange}
          className={inputStyle}
        >
          <option value="PF">
            Pessoa Física
          </option>

          <option value="PJ">
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

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Dados Bancários
        </h3>

        <div className="grid md:grid-cols-2 gap-4">

          <select
            name="banco"
            value={formData.banco}
            onChange={handleChange}
            className={inputStyle}
          >
            <option value="">
              Selecione um banco
            </option>

            <option value="001 - Banco do Brasil">
              001 - Banco do Brasil
            </option>

            <option value="104 - Caixa Econômica Federal">
              104 - Caixa Econômica Federal
            </option>

            <option value="237 - Bradesco">
              237 - Bradesco
            </option>

            <option value="341 - Itaú">
              341 - Itaú
            </option>

            <option value="033 - Santander">
              033 - Santander
            </option>

            <option value="260 - Nubank">
              260 - Nubank
            </option>

            <option value="077 - Inter">
              077 - Inter
            </option>

            <option value="290 - PagBank">
              290 - PagBank
            </option>

            <option value="323 - Mercado Pago">
              323 - Mercado Pago
            </option>

            <option value="336 - C6 Bank">
              336 - C6 Bank
            </option>

            <option value="756 - Sicoob">
              756 - Sicoob
            </option>

            <option value="748 - Sicredi">
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

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Configurações Financeiras
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
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

      <textarea
        name="observacoes"
        placeholder="Observações"
        value={formData.observacoes}
        onChange={handleChange}
        className={`${inputStyle} w-full min-h-[120px]`}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          className="
            bg-green-700
            text-white
            px-6
            py-3
            rounded-lg
            hover:bg-green-800
          "
        >
          {locadorEditando
            ? "Salvar Alterações"
            : "Salvar Locador"}
        </button>
      </div>
    </form>
  );
}