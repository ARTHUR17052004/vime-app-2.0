"use client";

// Caixa de pesquisa única do sistema -- sem ícone, sem botão de limpar
// (nada "dentro da caixa"), igual ao campo "Pesquisar" que já existia
// em Financeiro (financeiro/page.js). Era a referência que o usuário
// pediu pra aplicar em todo o resto do sistema -- antes essa versão
// tinha lupa + botão de limpar dentro de um wrapper mais alto/arredondado,
// visualmente "uma caixa dentro da caixa" comparado ao Financeiro.
export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
  autoFocus = false,
  disabled = false,
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      disabled={disabled}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      name="busca-vime"
      data-lpignore="true"
      data-1p-ignore
      className={`
        w-full

        rounded-xl

        p-3

        bg-[var(--surface-2)]

        border
        border-[var(--border-token)]

        text-[var(--text)]

        placeholder:text-[var(--text-faint)]

        transition-all
        duration-300

        hover:border-[var(--border-strong)]

        focus:outline-none
        focus:ring-2
        focus:ring-green-600

        disabled:opacity-60
        disabled:cursor-not-allowed

        ${className}
      `}
    />
  );
}
