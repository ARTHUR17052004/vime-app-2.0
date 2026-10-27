const insightsService = require("./insightsService");
const iaProviderService = require("./iaProviderService");
const sabadoFerramentasService = require("./sabadoFerramentasService");

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

/*
  "Pergunte ao VIME" -- chat do SABADO. Mesma regra de ouro do resumo
  executivo (nunca inventar número), só que aqui a IA pode chamar
  ferramentas (sabadoFerramentasService) pra buscar um dado específico
  sob demanda, em vez de receber tudo de uma vez só.
*/
const PROMPT_CHAT = `Você é o SABADO, assistente de dados do sistema VIME 2.0 (gestão de imóveis e kitnets).

Você conversa com um usuário do sistema respondendo perguntas sobre os dados REAIS do VIME -- financeiro, imóveis/kitnets, contratos, cobranças, vistorias e solicitações.

Regras obrigatórias:
- Nunca invente, estime ou arredonde de forma enganosa um número ou dado que não veio de uma chamada de ferramenta.
- Para QUALQUER pergunta sobre dados do sistema (totais, listas, "quais", "quantos", "quando"), chame a ferramenta adequada antes de responder -- nunca responda de cabeça.
- Se a pergunta pedir algo que nenhuma ferramenta cobre, diga claramente que não tem esse dado disponível -- nunca tente adivinhar.
- Você só EXPLICA dados -- nunca executa ação nenhuma (não cria, edita, exclui ou envia nada). Se pedirem uma ação, explique que você só consulta informações.
- Tom profissional, direto e em português. Respostas curtas (poucas frases ou uma lista curta), sem repetir tabela inteira de números.
- Nunca revele detalhes técnicos internos (nomes de tabelas, campos do banco, nomes de ferramentas).`;

const MAX_RODADAS_FERRAMENTA = 5;

async function responderChat(usuario, mensagens) {

  const historico = (mensagens || [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-20);

  if (historico.length === 0) {
    throw new Error("Nenhuma mensagem para responder.");
  }

  const conversa = [
    { role: "system", content: PROMPT_CHAT },
    ...historico.map((m) => ({ role: m.role, content: m.content })),
  ];

  for (let rodada = 0; rodada < MAX_RODADAS_FERRAMENTA; rodada++) {

    const mensagemModelo = await iaProviderService.gerarRespostaBruta(conversa, {
      ferramentas: sabadoFerramentasService.FERRAMENTAS,
    });

    conversa.push(mensagemModelo);

    if (!mensagemModelo.tool_calls?.length) {

      const texto = mensagemModelo.content?.trim();

      if (!texto) throw new Error("SABADO não retornou uma resposta.");

      return { texto, provedor: iaProviderService.PROVEDOR };

    }

    for (const chamada of mensagemModelo.tool_calls) {

      let argumentos = {};

      try {
        argumentos = chamada.function.arguments ? JSON.parse(chamada.function.arguments) : {};
      } catch {
        argumentos = {};
      }

      const resultado = await sabadoFerramentasService.executar(chamada.function.name, usuario, argumentos);

      conversa.push({
        role: "tool",
        tool_call_id: chamada.id,
        content: JSON.stringify(resultado),
      });

    }

  }

  throw new Error("SABADO não conseguiu concluir a resposta (muitas consultas em sequência). Tente reformular a pergunta.");

}

module.exports = { gerarResumoExecutivo, responderChat };
