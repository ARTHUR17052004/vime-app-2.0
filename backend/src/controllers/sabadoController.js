const sabadoService = require("../services/sabadoService");
const sabadoConversaService = require("../services/sabadoConversaService");
const iaProviderService = require("../services/iaProviderService");

const chat = async (req, res) => {
  try {

    const dados = await sabadoService.responderChat(req.usuario, {
      conversaId: req.body.conversaId,
      mensagem: req.body.mensagem,
    });

    return res.status(200).json({ success: true, data: dados });

  } catch (error) {

    return res.status(500).json({ success: false, message: error.message });

  }
};

const listarConversas = async (req, res) => {
  try {

    const dados = await sabadoConversaService.listarConversas(req.usuario, { busca: req.query.busca });

    return res.status(200).json({ success: true, data: dados });

  } catch (error) {

    return res.status(500).json({ success: false, message: error.message });

  }
};

const buscarConversa = async (req, res) => {
  try {

    const dados = await sabadoConversaService.buscarConversa(req.usuario, req.params.id);

    return res.status(200).json({ success: true, data: dados });

  } catch (error) {

    return res.status(404).json({ success: false, message: error.message });

  }
};

const excluirConversa = async (req, res) => {
  try {

    await sabadoConversaService.excluirConversa(req.usuario, req.params.id);

    return res.status(200).json({ success: true });

  } catch (error) {

    return res.status(404).json({ success: false, message: error.message });

  }
};

// Comando de voz: recebe o áudio gravado no navegador em base64 (mesmo
// padrão de foto/vídeo do resto do sistema, ver api.js) e devolve só o
// texto transcrito -- quem envia a pergunta de verdade pro SABADO depois
// é o próprio front, via /sabado/chat, igual a ter digitado.
const transcrever = async (req, res) => {
  try {

    const audio = req.body?.audio;

    if (typeof audio !== "string" || !audio) {
      return res.status(400).json({ success: false, message: "Áudio não informado." });
    }

    const combinacao = audio.match(/^data:([^;]+);base64,(.+)$/);

    if (!combinacao) {
      return res.status(400).json({ success: false, message: "Formato de áudio inválido." });
    }

    const [, mimeType, base64] = combinacao;
    const buffer = Buffer.from(base64, "base64");
    const extensao = mimeType.split("/")[1] || "webm";

    const texto = await iaProviderService.transcrever(buffer, {
      nomeArquivo: `audio.${extensao}`,
      mimeType,
    });

    return res.status(200).json({ success: true, data: { texto } });

  } catch (error) {

    return res.status(500).json({ success: false, message: error.message });

  }
};

module.exports = { chat, listarConversas, buscarConversa, excluirConversa, transcrever };
