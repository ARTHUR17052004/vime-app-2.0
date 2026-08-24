const prisma = require('../config/prisma');

const listarPorModulo = (modulo) => {
  return prisma.campoObrigatorio.findMany({
    where: { modulo },
    orderBy: { campo: 'asc' },
  });
};

// campos = [{ campo: "logradouro", obrigatorio: true }, ...]
const salvar = async (modulo, campos) => {

  if (!Array.isArray(campos)) {
    throw new Error('Lista de campos inválida.');
  }

  for (const item of campos) {

    await prisma.campoObrigatorio.upsert({
      where: {
        modulo_campo: { modulo, campo: item.campo },
      },
      create: {
        modulo,
        campo: item.campo,
        obrigatorio: item.obrigatorio !== false,
      },
      update: {
        obrigatorio: item.obrigatorio !== false,
      },
    });

  }

  return listarPorModulo(modulo);

};

const rotulosPadrao = {
  nome: 'Nome',
  cep: 'CEP',
  logradouro: 'Logradouro',
  numero: 'Número',
  complemento: 'Complemento',
  bairro: 'Bairro',
  cidade: 'Cidade',
  uf: 'UF',
  locadorId: 'Locador',
  kitnets: 'Quantidade de Kitnets',
  aluguel: 'Valor do Aluguel',
  vencimento: 'Dia de Vencimento',
};

// Lança erro listando os campos configurados como obrigatórios para o
// módulo que vieram vazios em `dados`. Não faz nada se o módulo não
// tiver nenhuma configuração salva (comportamento atual, sem trava).
const validar = async (modulo, dados) => {

  const configurados = await listarPorModulo(modulo);

  const obrigatorios = configurados.filter((c) => c.obrigatorio);

  if (obrigatorios.length === 0) return;

  const faltando = obrigatorios.filter((c) => {
    const valor = dados[c.campo];
    return valor === undefined || valor === null || valor === '';
  });

  if (faltando.length > 0) {

    const nomes = faltando.map((c) => rotulosPadrao[c.campo] || c.campo);

    throw new Error(
      `Preencha os campos obrigatórios: ${nomes.join(', ')}.`
    );

  }

};

module.exports = {
  listarPorModulo,
  salvar,
  validar,
};
