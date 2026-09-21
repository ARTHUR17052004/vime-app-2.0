// Recursos que são da EMPRESA inteira (contas de integração, configuração
// geral, escolha de notificações...) e não de um locador específico.
// Usuário restrito a um locador (req.usuario.locadorId) não pode ver nem
// mexer neles, mesmo com a permissão do perfil.

const negar = (res, mensagem) =>
  res.status(403).json({ success: false, message: mensagem });

const apenasIrrestrito = (req, res, next) => {

  if (req.usuario?.locadorId) {
    return negar(res, "Este recurso é geral da empresa e não está disponível para usuário restrito a um locador.");
  }

  return next();

};

const apenasAdministradorGeral = (req, res, next) => {

  if (req.usuario?.perfil !== "ADMINISTRADOR" || req.usuario?.locadorId) {
    return negar(res, "Apenas o administrador geral pode alterar isto.");
  }

  return next();

};

module.exports = { apenasIrrestrito, apenasAdministradorGeral };
