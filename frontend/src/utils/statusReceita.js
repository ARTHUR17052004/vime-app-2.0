// "PENDENTE" sozinho não diz se já foi mandada pro banco ou não -- olha
// gatewayReferencia (só fica preenchido depois do "Enviar Cobrança")
// pra separar "Pendente" (ainda não enviada) de "Em Aberto" (enviada,
// aguardando o inquilino pagar). Usado tanto pro badge da lista quanto
// pelo filtro de Status -- senão filtrar por "Pendente" também trazia
// quem já estava "Em Aberto" (mesmo status PENDENTE por baixo, só
// mostrado diferente).
export function statusExibidoReceita(item) {

  if (item.status === "PAGO" || item.status === "PAGA") {
    return { codigo: "PAGA", texto: "Pago", variant: "emerald" };
  }

  if (item.status === "ATRASADA") {
    return { codigo: "ATRASADA", texto: "Atrasada", variant: "red" };
  }

  if (item.status === "CANCELADA") {
    return { codigo: "CANCELADA", texto: "Cancelada", variant: "gray" };
  }

  if (item.gatewayReferencia) {
    return { codigo: "EM_ABERTO", texto: "Em Aberto", variant: "blue" };
  }

  return { codigo: "PENDENTE", texto: "Pendente", variant: "yellow" };

}
