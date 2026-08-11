"use client";

export default function StepDadosPessoais({
  formData,
  handleChange,
}) {
  const inputStyle =
    "border border-white/10 rounded-xl p-3 text-white bg-white/5 backdrop-blur placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="grid grid-cols-2 gap-4">

      <input
        name="nome"
        placeholder="Nome Completo"
        value={formData.nome}
        onChange={handleChange}
        className={inputStyle}
        required
      />

      <input
        name="email"
        placeholder="E-mail"
        value={formData.email}
        onChange={handleChange}
        className={inputStyle}
        required
      />

      <input
        name="telefone"
        placeholder="Telefone"
        value={formData.telefone}
        onChange={handleChange}
        className={inputStyle}
        required
      />

      <input
        name="cpf"
        placeholder="CPF"
        value={formData.cpf}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="rg"
        placeholder="RG"
        value={formData.rg}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        type="date"
        name="dataNascimento"
        value={formData.dataNascimento}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="enderecoAnterior"
        placeholder="Endereço Anterior"
        value={formData.enderecoAnterior}
        onChange={handleChange}
        className={`${inputStyle} col-span-2`}
      />

      <input
        name="contatoEmergencia"
        placeholder="Contato de Emergência"
        value={formData.contatoEmergencia}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="telefoneEmergencia"
        placeholder="Telefone Emergência"
        value={formData.telefoneEmergencia}
        onChange={handleChange}
        className={inputStyle}
      />

    </div>
  );
}