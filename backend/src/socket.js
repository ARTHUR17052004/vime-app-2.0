let io = null;

const conexoes = new Map();

function setIO(socketIO) {
  io = socketIO;
}

function getIO() {
  return io;
}

function registrarConexao(socket) {
  if (!socket.usuario?.id) return;

  const existente = conexoes.get(socket.usuario.id);

  if (existente) {
    existente.sockets.add(socket.id);
    return;
  }

  conexoes.set(socket.usuario.id, {
    usuario: socket.usuario,
    sockets: new Set([socket.id]),
    conectadoEm: new Date(),
  });
}

function removerConexao(socket) {
  if (!socket.usuario?.id) return;

  const existente = conexoes.get(socket.usuario.id);

  if (!existente) return;

  existente.sockets.delete(socket.id);

  if (existente.sockets.size === 0) {
    conexoes.delete(socket.usuario.id);
  }
}

function listarOnline() {
  return Array.from(conexoes.values()).map((conexao) => ({
    id: conexao.usuario.id,
    nome: conexao.usuario.nome,
    email: conexao.usuario.email,
    perfil: conexao.usuario.perfil,
    conectadoEm: conexao.conectadoEm,
  }));
}

module.exports = {
  setIO,
  getIO,
  registrarConexao,
  removerConexao,
  listarOnline,
};