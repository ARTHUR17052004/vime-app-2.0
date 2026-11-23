const prisma = require("../config/prisma");

// Algoritmo de Gauss/Meeus-Jones-Butcher pra Páscoa (gregoriano) --
// precisa pra achar Sexta-feira Santa (Páscoa - 2 dias), o único
// feriado nacional móvel. Carnaval e Corpus Christi NÃO são feriado
// nacional por lei (são só ponto facultativo) -- se o locador quiser
// tratar algum deles como não-útil, adiciona na tela Administração >
// Feriados (mesma tabela do estadual).
const calcularPascoa = (ano) => {

  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31); // 3=março, 4=abril
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(ano, mes - 1, dia);

};

// Feriados nacionais de verdade (Lei 10.607/2002 + Lei 14.759/2023,
// que tornou 20/11 feriado nacional a partir de 2024) -- calculados
// sozinhos, nunca precisam de cadastro nem manutenção anual. Qualquer
// outro dia (estadual, ponto facultativo que o locador queira tratar
// como não-útil) entra pela tabela Feriado (ver feriadoService.js).
const feriadosNacionais = (ano) => {

  const pascoa = calcularPascoa(ano);
  const sextaFeiraSanta = new Date(pascoa);
  sextaFeiraSanta.setDate(sextaFeiraSanta.getDate() - 2);

  return [
    { data: new Date(ano, 0, 1), nome: "Confraternização Universal" },
    { data: sextaFeiraSanta, nome: "Sexta-feira Santa" },
    { data: new Date(ano, 3, 21), nome: "Tiradentes" },
    { data: new Date(ano, 4, 1), nome: "Dia do Trabalho" },
    { data: new Date(ano, 8, 7), nome: "Independência do Brasil" },
    { data: new Date(ano, 9, 12), nome: "Nossa Senhora Aparecida" },
    { data: new Date(ano, 10, 2), nome: "Finados" },
    { data: new Date(ano, 10, 15), nome: "Proclamação da República" },
    { data: new Date(ano, 10, 20), nome: "Dia Nacional de Zumbi e da Consciência Negra" },
    { data: new Date(ano, 11, 25), nome: "Natal" },
  ];

};

const chaveDia = (data) => {
  const d = new Date(data);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

// Cache em memória (1h) pra não bater no banco toda vez que um job
// processa uma receita -- os feriados de um ano não mudam sozinhos,
// só quando o admin mexe na tela (aí invalidarCache() zera na hora).
let cache = null;

const chaveAnos = (anos) => [...new Set(anos)].sort().join(",");

const invalidarCache = () => {
  cache = null;
};

// anos: array de anos inteiros que precisam estar cobertos (ex.: ao
// somar dias úteis perto da virada do ano, passa [anoAtual, anoAtual+1]).
const obterFeriadosSet = async (anos) => {

  const chave = chaveAnos(anos);

  if (cache && cache.chave === chave && Date.now() - cache.carregadoEm < 60 * 60 * 1000) {
    return cache.set;
  }

  const nacionais = anos.flatMap(feriadosNacionais).map((f) => f.data);

  const minAno = Math.min(...anos);
  const maxAno = Math.max(...anos);

  const adicionais = await prisma.feriado.findMany({
    where: {
      data: {
        gte: new Date(minAno, 0, 1),
        lt: new Date(maxAno + 1, 0, 1),
      },
    },
    select: { data: true },
  });

  const set = new Set([...nacionais, ...adicionais.map((f) => f.data)].map(chaveDia));

  cache = { chave, set, carregadoEm: Date.now() };

  return set;

};

// domingo (0) e sábado (6) nunca são úteis, nem que dia esteja no set
// de feriados (nacional calculado ou adicional cadastrado).
const ehDiaUtil = (data, feriadosSet) => {
  const diaSemana = data.getDay();
  if (diaSemana === 0 || diaSemana === 6) return false;
  return !feriadosSet.has(chaveDia(data));
};

// Avança (nunca recua) até cair num dia útil -- usado pro vencimento
// mensal: se o dia 20 cair no sábado, vence na segunda (dia útil
// seguinte), igual pedido pelo usuário em 23/11/2026.
const proximoDiaUtil = (data, feriadosSet) => {
  const d = new Date(data);
  while (!ehDiaUtil(d, feriadosSet)) {
    d.setDate(d.getDate() + 1);
  }
  return d;
};

// "+72 horas" virou "+3 dias ÚTEIS" -- sábado, domingo e feriado não
// contam pro relógio (o zelador não trabalha nesses dias). Usado nos
// relógios de atraso->risco de corte e corte->esvaziar kitnet.
const adicionarDiasUteis = (dataBase, quantidadeDias, feriadosSet) => {
  const d = new Date(dataBase);
  let contados = 0;
  while (contados < quantidadeDias) {
    d.setDate(d.getDate() + 1);
    if (ehDiaUtil(d, feriadosSet)) contados++;
  }
  return d;
};

module.exports = {
  feriadosNacionais,
  obterFeriadosSet,
  invalidarCache,
  ehDiaUtil,
  proximoDiaUtil,
  adicionarDiasUteis,
};
