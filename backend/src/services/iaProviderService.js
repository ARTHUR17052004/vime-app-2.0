/*
  Camada abstrata de provedor de IA -- o resto do sistema (sabadoService)
  só chama `gerarResposta(mensagens)` e nunca sabe se por trás está Groq
  ou OpenAI. Troca de provedor é só variável de ambiente, sem mexer em
  código: quando a chave da OpenAI chegar, basta IA_PROVEDOR=openai.

  Groq expõe uma API compatível com o formato "chat completions" da
  OpenAI, então o mesmo client funciona pros dois -- só muda baseURL,
  chave e nome do modelo.
*/

const PROVEDOR = process.env.IA_PROVEDOR || "groq";

const CONFIGS = {
  groq: {
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
    modelo: process.env.GROQ_MODELO || "openai/gpt-oss-120b",
    envVar: "GROQ_API_KEY",
  },
  openai: {
    baseURL: "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
    modelo: process.env.OPENAI_MODELO || "gpt-4o-mini",
    envVar: "OPENAI_API_KEY",
  },
};

function disponivel() {
  return Boolean(CONFIGS[PROVEDOR]?.apiKey);
}

async function gerarResposta(mensagens, { temperatura = 0.3 } = {}) {

  const config = CONFIGS[PROVEDOR];

  if (!config) {
    throw new Error(`Provedor de IA desconhecido: "${PROVEDOR}". Use "groq" ou "openai" em IA_PROVEDOR.`);
  }

  if (!config.apiKey) {
    throw new Error(`Chave de API ausente para o provedor "${PROVEDOR}" -- defina ${config.envVar} no .env.`);
  }

  const resposta = await fetch(`${config.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.modelo,
      messages: mensagens,
      temperature: temperatura,
    }),
  });

  if (!resposta.ok) {
    const corpo = await resposta.text().catch(() => "");
    throw new Error(`Erro do provedor de IA (${PROVEDOR}, ${resposta.status}): ${corpo.slice(0, 500)}`);
  }

  const dados = await resposta.json();
  const texto = dados.choices?.[0]?.message?.content?.trim();

  if (!texto) {
    throw new Error(`Provedor de IA (${PROVEDOR}) retornou resposta vazia.`);
  }

  return texto;

}

module.exports = { gerarResposta, disponivel, PROVEDOR };
