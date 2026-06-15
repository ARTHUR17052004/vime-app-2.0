"use client";

export default function StepDadosPessoais({
  formData,
  handleChange,
}) {
  const inputStyle =
    "border border-gray-300 rounded-xl p-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500";

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