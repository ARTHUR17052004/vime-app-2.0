const prisma = require('../config/prisma');
const { filtroInquilino, filtroContrato, filtroKitnet, filtroUnidade } = require('../utils/escopoLocador');
const { normalizarBusca } = require('../utils/busca');

// Pega os candidatos (já escopados por locador) e filtra/corta em JS,
// em vez do "contains" do Prisma -- ILIKE do Postgres é insensível a
// maiúscula/minúscula, mas não a acento ("andre" nunca achava
// "André"), e os volumes aqui (dezenas/poucas centenas de linhas por
// tabela nesse sistema) não justificam reescrever tudo em SQL cru só
// pra resolver isso.
const bateComTermo = (registro, campos, termoNormalizado) =>
  campos.some((campo) => normalizarBusca(registro[campo]).includes(termoNormalizado));

const buscar = async (req, res, next) => {

  try {

    const termo = (req.query.q || '').trim();

    if (termo.length < 2) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const termoNormalizado = normalizarBusca(termo);

    const isAdmin = req.usuario?.perfil === 'ADMINISTRADOR';

    const [locadoresTodos, inquilinosTodos, contratosTodos, kitnetsTodos, unidadesTodos, usuariosTodos] = await Promise.all([

      isAdmin
        ? prisma.locador.findMany()
        : Promise.resolve([]),

      prisma.inquilino.findMany({
        where: filtroInquilino(req.usuario),
      }),

      prisma.contrato.findMany({
        where: filtroContrato(req.usuario),
        // arquivoDados é o PDF/foto do contrato em base64 -- a busca só
        // precisa saber que o contrato existe, não arrastar o arquivo
        // inteiro em cada resultado (mesmo bug do GET /contratos, ver
        // contratoService.listar).
        omit: { arquivoDados: true },
        include: { inquilino: true, locador: true },
      }),

      prisma.kitnet.findMany({
        where: filtroKitnet(req.usuario),
      }),

      prisma.unidade.findMany({
        where: filtroUnidade(req.usuario),
      }),

      isAdmin
        ? prisma.usuario.findMany()
        : Promise.resolve([]),

    ]);

    const locadores = locadoresTodos
      .filter((l) => bateComTermo(l, ['nome', 'email', 'cpfCnpj'], termoNormalizado))
      .slice(0, 5);

    const inquilinos = inquilinosTodos
      .filter((i) => bateComTermo(i, ['nome', 'email', 'cpf'], termoNormalizado))
      .slice(0, 5);

    const contratos = contratosTodos
      .filter((c) =>
        normalizarBusca(c.inquilino?.nome).includes(termoNormalizado) ||
        normalizarBusca(c.locador?.nome).includes(termoNormalizado)
      )
      .slice(0, 5);

    const kitnets = kitnetsTodos
      .filter((k) => bateComTermo(k, ['numero', 'nome'], termoNormalizado))
      .slice(0, 5);

    const unidades = unidadesTodos
      .filter((u) => bateComTermo(u, ['nome', 'cidade'], termoNormalizado))
      .slice(0, 5);

    const usuarios = usuariosTodos
      .filter((u) => bateComTermo(u, ['nome', 'email'], termoNormalizado))
      .slice(0, 5);

    const resultados = [

      ...locadores.map((l) => ({
        tipo: 'LOCADOR',
        label: 'Locador',
        id: l.id,
        titulo: l.nome,
        subtitulo: l.email || l.cpfCnpj || '',
        href: `/locadores/${l.id}`,
      })),

      ...inquilinos.map((i) => ({
        tipo: 'INQUILINO',
        label: 'Inquilino',
        id: i.id,
        titulo: i.nome,
        subtitulo: i.email || i.cpf || '',
        href: `/inquilinos/${i.id}`,
      })),

      ...contratos.map((c) => ({
        tipo: 'CONTRATO',
        label: 'Contrato',
        id: c.id,
        titulo: `${c.inquilino?.nome || 'Inquilino'} — ${c.locador?.nome || 'Locador'}`,
        subtitulo: c.status,
        href: `/contratos/${c.id}`,
      })),

      ...kitnets.map((k) => ({
        tipo: 'KITNET',
        label: 'Kitnet',
        id: k.id,
        titulo: k.nome || `Kitnet ${k.numero}`,
        subtitulo: k.status,
        href: `/kitnets/${k.id}`,
      })),

      ...unidades.map((u) => ({
        tipo: 'UNIDADE',
        label: 'Unidade',
        id: u.id,
        titulo: u.nome,
        subtitulo: [u.cidade, u.uf].filter(Boolean).join('/'),
        href: `/unidades/${u.id}`,
      })),

      ...usuarios.map((u) => ({
        tipo: 'USUARIO',
        label: 'Usuário',
        id: u.id,
        titulo: u.nome,
        subtitulo: u.email,
        href: `/administracao/usuarios/${u.id}`,
      })),

    ];

    return res.status(200).json({
      success: true,
      data: resultados,
    });

  } catch (error) {

    next(error);

  }

};

module.exports = {
  buscar,
};
