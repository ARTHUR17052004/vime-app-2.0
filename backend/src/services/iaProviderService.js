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
    modeloTranscricao: process.env.GROQ_MODELO_TRANSCRICAO || "whisper-large-v3-turbo",
    envVar: "GROQ_API_KEY",
  },
  openai: {
    baseURL: "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
    modelo: process.env.OPENAI_MODELO || "gpt-4o-mini",
    modeloTranscricao: process.env.OPENAI_MODELO_TRANSCRICAO || "whisper-1",
    envVar: "OPENAI_API_KEY",
  },
};

function disponivel() {
  return Boolean(CONFIGS[PROVEDOR]?.apiKey);
}

// Devolve a mensagem bruta do modelo (não só o texto) -- quem chama
// pode passar `ferramentas` (formato "tools" da OpenAI) e precisa
// inspecionar `tool_calls` antes de decidir se já é a resposta final
// ou se precisa rodar uma função e mandar o resultado de volta.
async function gerarRespostaBruta(mensagens, { temperatura = 0.3, ferramentas } = {}) {

  const config = CONFIGS[PROVEDOR];

  if (!config) {
    throw new Error(`Provedor de IA desconhecido: "${PROVEDOR}". Use "groq" ou "openai" em IA_PROVEDOR.`);
  }

  if (!config.apiKey) {
    throw new Error(`Chave de API ausente para o provedor "${PROVEDOR}" -- defina ${config.envVar} no .env.`);
  }

  const corpo = {
    model: config.modelo,
    messages: mensagens,
    temperature: temperatura,
  };

  if (ferramentas) {
    corpo.tools = ferramentas;
    corpo.tool_choice = "auto";
  }

  const resposta = await fetch(`${config.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(corpo),
  });

  if (!resposta.ok) {
    const corpoErro = await resposta.text().catch(() => "");
    throw new Error(`Erro do provedor de IA (${PROVEDOR}, ${resposta.status}): ${corpoErro.slice(0, 500)}`);
  }

  const dados = await resposta.json();
  const mensagem = dados.choices?.[0]?.message;

  if (!mensagem) {
    throw new Error(`Provedor de IA (${PROVEDOR}) retornou resposta vazia.`);
  }

  return mensagem;

}

async function gerarResposta(mensagens, opcoes) {

  const mensagem = await gerarRespostaBruta(mensagens, opcoes);
  const texto = mensagem.content?.trim();

  if (!texto) {
    throw new Error(`Provedor de IA (${PROVEDOR}) retornou resposta vazia.`);
  }

  return texto;

}

// Comando de voz do SABADO (ver sabadoController.transcrever) -- manda o
// áudio gravado no navegador pro mesmo provedor de IA já configurado, que
// também expõe um modelo Whisper na mesma chave/baseURL (endpoint
// diferente do chat). Usado em vez da Web Speech API do navegador porque
// Safari/iOS não implementa reconhecimento de fala nenhum -- gravar áudio
// (getUserMedia) e transcrever no servidor funciona igual em qualquer
// aparelho, iPhone incluído.
async function transcrever(buffer, { nomeArquivo = "audio.webm", mimeType = "audio/webm" } = {}) {

  const config = CONFIGS[PROVEDOR];

  if (!config) {
    throw new Error(`Provedor de IA desconhecido: "${PROVEDOR}". Use "groq" ou "openai" em IA_PROVEDOR.`);
  }

  if (!config.apiKey) {
    throw new Error(`Chave de API ausente para o provedor "${PROVEDOR}" -- defina ${config.envVar} no .env.`);
  }

  const formData = new FormData();
  formData.append("file", new Blob([buffer], { type: mimeType }), nomeArquivo);
  formData.append("model", config.modeloTranscricao);
  formData.append("language", "pt");

  const resposta = await fetch(`${config.baseURL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: formData,
  });

  if (!resposta.ok) {
    const corpoErro = await resposta.text().catch(() => "");
    throw new Error(`Erro do provedor de IA (${PROVEDOR}, ${resposta.status}) ao transcrever áudio: ${corpoErro.slice(0, 500)}`);
  }

  const dados = await resposta.json();
  const texto = dados.text?.trim();

  if (!texto) {
    throw new Error("Não consegui entender nada no áudio gravado.");
  }

  return texto;

}

module.exports = { gerarResposta, gerarRespostaBruta, transcrever, disponivel, PROVEDOR };
