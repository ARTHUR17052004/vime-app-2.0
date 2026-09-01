// Usuário sem locadorId (ou "Todos" escolhido no cadastro) enxerga o
// sistema inteiro -- comportamento de sempre. Com um locador definido,
// cada listagem abaixo devolve só o que pertence a esse locador.
// `usuario` aqui é sempre `req.usuario` (payload do JWT).

const filtroUnidade = (usuario) => {
  if (!usuario?.locadorId) return {};
  return { locadorId: usuario.locadorId };
};

const filtroKitnet = (usuario) => {
  if (!usuario?.locadorId) return {};
  return { unidade: { locadorId: usuario.locadorId } };
};

const filtroContrato = (usuario) => {
  if (!usuario?.locadorId) return {};
  return { locadorId: usuario.locadorId };
};

const filtroInquilino = (usuario) => {
  if (!usuario?.locadorId) return {};
  return { kitnet: { unidade: { locadorId: usuario.locadorId } } };
};

// Receita pode vir presa a um Contrato OU direto a um Inquilino (sem
// contrato formal) -- as duas pontas levam ao locador por um caminho
// diferente, então checa as duas. Uma receita totalmente avulsa (sem
// contrato nem inquilino) não bate em nenhuma delas e fica de fora,
// que é o esperado pra quem só pode ver um locador específico.
const filtroReceita = (usuario) => {
  if (!usuario?.locadorId) return {};
  return {
    OR: [
      { contrato: { locadorId: usuario.locadorId } },
      { inquilino: { kitnet: { unidade: { locadorId: usuario.locadorId } } } },
    ],
  };
};

const filtroDespesa = (usuario) => {
  if (!usuario?.locadorId) return {};
  return { unidade: { locadorId: usuario.locadorId } };
};

// Vistoria pode estar presa direto numa Unidade OU numa Kitnet (os
// dois são opcionais e independentes) -- checa os dois caminhos.
const filtroVistoria = (usuario) => {
  if (!usuario?.locadorId) return {};
  return {
    OR: [
      { unidade: { locadorId: usuario.locadorId } },
      { kitnet: { unidade: { locadorId: usuario.locadorId } } },
    ],
  };
};

module.exports = {
  filtroUnidade,
  filtroKitnet,
  filtroContrato,
  filtroInquilino,
  filtroReceita,
  filtroDespesa,
  filtroVistoria,
};
