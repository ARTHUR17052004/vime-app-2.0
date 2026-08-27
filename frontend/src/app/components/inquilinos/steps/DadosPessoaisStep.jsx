"use client";

import { validarCpf } from "../../../../utils/cpf";

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

export default function StepDadosPessoais({
  formData,
  handleChange,
  obrigatorios = new Set(),
}) {
  const inputStyle =
    "w-full border border-[var(--border-token)] rounded-xl p-3 text-[var(--text)] bg-[var(--surface-2)] backdrop-blur placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  const cpfDigitado = (formData.cpf || "").replace(/\D/g, "").length > 0;
  const cpfInvalido = cpfDigitado && !validarCpf(formData.cpf);

  return (
    <div className="grid grid-cols-2 gap-4">

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

      <Campo label="E-mail" obrigatorio>
        <input
          name="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
          className={inputStyle}
          required
        />
      </Campo>

      <Campo label="Telefone" obrigatorio>
        <input
          name="telefone"
          placeholder="Telefone"
          value={formData.telefone}
          onChange={handleChange}
          className={inputStyle}
          required
        />
      </Campo>

      <Campo label="CPF" obrigatorio={obrigatorios.has("cpf")}>
        <input
          name="cpf"
          placeholder="CPF"
          value={formData.cpf}
          onChange={handleChange}
          className={`${inputStyle} ${
            cpfInvalido ? "border-red-500/60 focus:border-red-500" : ""
          }`}
          required={obrigatorios.has("cpf")}
        />

        {cpfInvalido && (
          <p className="mt-1.5 text-xs text-red-400">
            CPF inválido.
          </p>
        )}
      </Campo>

      <Campo label="Data de Nascimento" obrigatorio={obrigatorios.has("dataNascimento")}>
        <input
          type="date"
          name="dataNascimento"
          value={formData.dataNascimento}
          onChange={handleChange}
          className={inputStyle}
          required={obrigatorios.has("dataNascimento")}
        />
      </Campo>

      <Campo label="Contato de Emergência" obrigatorio={obrigatorios.has("contatoEmergencia")}>
        <input
          name="contatoEmergencia"
          placeholder="Contato de Emergência"
          value={formData.contatoEmergencia}
          onChange={handleChange}
          className={inputStyle}
          required={obrigatorios.has("contatoEmergencia")}
        />
      </Campo>

      <Campo label="Telefone Emergência" obrigatorio={obrigatorios.has("telefoneEmergencia")}>
        <input
          name="telefoneEmergencia"
          placeholder="Telefone Emergência"
          value={formData.telefoneEmergencia}
          onChange={handleChange}
          className={inputStyle}
          required={obrigatorios.has("telefoneEmergencia")}
        />
      </Campo>

    </div>
  );
}
