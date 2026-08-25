// Usado por todo formulário ligado a "Campos Obrigatórios": recebe a
// lista de campos que devem ser conferidos nesta etapa/formulário, o
// formData atual, o Set de campos marcados como obrigatório (vindo da
// config do admin) e um mapa de rótulos -- devolve os rótulos dos que
// estão vazios. Chamado só na hora de tentar avançar/salvar, nunca de
// forma ambiente, pra não gerar aviso sem o usuário ter feito nada.
export function obterCamposFaltando(campos, formData, obrigatorios, rotulos) {

  return campos
    .filter((campo) => obrigatorios.has(campo))
    .filter((campo) => {
      const valor = formData[campo];
      return valor === undefined || valor === null || valor === "";
    })
    .map((campo) => rotulos[campo] || campo);

}

export function mensagemCamposFaltando(faltando) {

  if (faltando.length === 0) return "";

  if (faltando.length === 1) {
    return `${faltando[0]} é obrigatório para prosseguir.`;
  }

  return `Preencha os campos obrigatórios para prosseguir: ${faltando.join(", ")}.`;

}
