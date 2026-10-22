const insightsService = require("./insightsService");
const iaProviderService = require("./iaProviderService");

/*
  SABADO -- Fase 4 do VIME Insights. A regra de ouro: a IA só EXPLICA
  números que o insightsService já calculou (mesmas regras de negócio
  usadas no resto do sistema). Nunca gera, estima ou corrige um valor
  por conta própria, e nunca recebe acesso a rodar SQL ou buscar dados
  fora do que é passado explicitamente no prompt.
*/

// Só o necessário pro resumo em texto -- "navegacao" é usado pelo
// front pra montar links, não serve pra nada no prompt e só gasta
// token à toa.
function enxugarIndicadores(indicadores) {
  return indicadores.map(({ chave, rotulo, valor, formato, escopo, criterio, comparacao }) => ({
    chave, rotulo, valor, formato, escopo, criterio,
    ...(comparacao ? { comparacao } : {}),
  }));
}

const PROMPT_SISTEMA = `Você é o SABADO, assistente de dados do sistema VIME 2.0 (gestão de imóveis e kitnets).

Sua única função aqui é escrever um resumo executivo curto, em português claro, explicando os números abaixo -- que já foram calculados pelo sistema com as regras de negócio corretas.

Regras obrigatórias:
- Use SOMENTE os valores fornecidos nos dados. Nunca invente, estime, arredonde de forma enganosa ou calcule um número novo que não esteja ali.
- Nunca diga que tem acesso a dados além dos fornecidos.
- Não repita todos os números um por um -- destaque o que é mais relevante (problemas, pendências, variações grandes) e mencione os demais de forma resumida.
- Tom profissional e direto, como um resumo pra um gestor que não tem tempo de olhar todos os detalhes.
- No máximo 2 parágrafos curtos.
- Nunca sugira ações que o sistema não tem (ex.: não ofereça enviar mensagens, criar relatórios ou mudar dados -- você só explica).`;

async function gerarResumoExecutivo(usuario, { inicio, fim } = {}) {

  const [financeiro, imoveis, contratos, solicitacoesVistorias] = await Promise.all([
    insightsService.resumoFinanceiro(usuario, { inicio, fim }),
    insightsService.resumoImoveis(usuario),
    insightsService.resumoContratos(usuario),
    insightsService.resumoSolicitacoesVistorias(usuario),
  ]);

  const dados = {
    periodo: financeiro.periodo,
    financeiro: enxugarIndicadores(financeiro.indicadores),
    imoveis: enxugarIndicadores(imoveis.indicadores),
    contratos: enxugarIndicadores(contratos.indicadores),
    solicitacoesVistorias: enxugarIndicadores(solicitacoesVistorias.indicadores),
  };

  const texto = await iaProviderService.gerarResposta([
    { role: "system", content: PROMPT_SISTEMA },
    { role: "user", content: JSON.stringify(dados) },
  ]);

  return {
    texto,
    provedor: iaProviderService.PROVEDOR,
    periodo: financeiro.periodo,
    geradoEm: new Date().toISOString(),
  };

}

module.exports = { gerarResumoExecutivo };
