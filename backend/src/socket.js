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

// Aviso genérico de "algo mudou" pra qualquer tela que esteja aberta
// -- usado principalmente por mudanças que acontecem em segundo plano
// (webhook do banco/Clicksign confirmando, job noturno) e que, sem
// isso, só apareciam depois de a pessoa dar F5 na página. `tipo`
// identifica QUAL lista deve se atualizar ("contrato", "receita",
// "inquilino"...); cada tela só reage ao(s) tipo(s) que exibe.
function emitirAtualizacao(tipo, extra = {}) {

  if (!io) return;

  io.emit("dados:atualizados", { tipo, ...extra, em: new Date() });

}

module.exports = {
  setIO,
  getIO,
  registrarConexao,
  removerConexao,
  listarOnline,
  emitirAtualizacao,
};