// Recursos que são da EMPRESA inteira (contas de integração, configuração
// geral, escolha de notificações...) e não de um locador específico.
// Usuário restrito a um locador (req.usuario.locadorId) não pode ver nem
// mexer neles, mesmo com a permissão do perfil.

const negar = (res, mensagem) =>
  res.status(403).json({ success: false, message: mensagem });

// req.usuario.locadorId pode estar preenchido só porque um usuário
// IRRESTRITO escolheu filtrar a tela por um locador (ver
// authMiddleware.js, header x-locador-filtro) -- isso não é uma restrição
// de verdade, por isso usa req.usuario.podeEscolherLocador (calculado a
// partir do cadastro original, antes do filtro) pra diferenciar de quem
// tem locador fixo mesmo.
const restritoDeVerdade = (usuario) => Boolean(usuario?.locadorId) && !usuario?.podeEscolherLocador;

const apenasIrrestrito = (req, res, next) => {

  if (restritoDeVerdade(req.usuario)) {
    return negar(res, "Este recurso é geral da empresa e não está disponível para usuário restrito a um locador.");
  }

  return next();

};

const apenasAdministradorGeral = (req, res, next) => {

  if (req.usuario?.perfil !== "ADMINISTRADOR" || restritoDeVerdade(req.usuario)) {
    return negar(res, "Apenas o administrador geral pode alterar isto.");
  }

  return next();

};

module.exports = { apenasIrrestrito, apenasAdministradorGeral };
