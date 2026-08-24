const authService = require('../services/authService');
const usuarioService = require('../services/usuarioService');

// Em produção, front (vimesistema.online) e back (onrender.com) são domínios
// diferentes — cookie cross-site só é enviado pelo navegador com
// SameSite=None + Secure (exige HTTPS). Em dev local, front e back estão em
// portas do mesmo host, então Lax + non-secure funciona (e é exigido, já que
// SameSite=None sem HTTPS é rejeitado pelo navegador).
const emProducao = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: emProducao,
  sameSite: emProducao ? "none" : "lax",
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const resultado = await authService.login(email, senha);

    res.cookie("token", resultado.token, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 1 dia, mesmo prazo do JWT
    });

    return res.status(200).json({
      success: true,
      data: resultado
    });

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: error.message
    });

  }
};

const logout = async (req, res) => {

  res.clearCookie("token", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logout realizado com sucesso.",
  });
};

const me = async (req, res) => {

  return res.status(200).json({
    success: true,
    data: req.usuario
  });

};

// Edição do próprio perfil (nome/email/foto) -- diferente de
// usuarioController.atualizar, que é só pra admin gerenciar outras
// contas. Aqui só deixa mexer no que é seguro o próprio usuário mudar
// sozinho: nada de perfil/permissão/status.
const atualizarMe = async (req, res) => {
  try {

    const { nome, email, foto } = req.body;

    const usuario = await usuarioService.atualizar(req.usuario.id, { nome, email, foto });

    // authService.login() devolve o perfil já achatado em string e as
    // permissões resolvidas (o que o front espera em usuario.perfil /
    // usuario.permissoes) -- mantém consistente aqui.
    return res.status(200).json({
      success: true,
      data: {
        ...usuario,
        perfil: usuario.perfil?.nome,
        permissoes: usuario.perfil?.permissoes || [],
      },
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

const esqueciSenha = async (req, res) => {
  try {

    const { email } = req.body;

    await authService.solicitarRedefinicaoSenha(email);

    return res.status(200).json({
      success: true,
      message: "E-mail de redefinição enviado com sucesso.",
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

const redefinirSenha = async (req, res) => {
  try {

    const { token, novaSenha } = req.body;

    await authService.redefinirSenha(token, novaSenha);

    return res.status(200).json({
      success: true,
      message: "Senha redefinida com sucesso.",
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  login,
  logout,
  me,
  atualizarMe,
  esqueciSenha,
  redefinirSenha,
};