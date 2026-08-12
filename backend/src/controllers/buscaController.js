const prisma = require('../config/prisma');

const buscar = async (req, res, next) => {

  try {

    const termo = (req.query.q || '').trim();

    if (termo.length < 2) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const isAdmin = req.usuario?.perfil === 'ADMINISTRADOR';

    const [locadores, inquilinos, contratos, kitnets, unidades, usuarios] = await Promise.all([

      isAdmin
        ? prisma.locador.findMany({
            where: {
              OR: [
                { nome: { contains: termo, mode: 'insensitive' } },
                { email: { contains: termo, mode: 'insensitive' } },
                { cpfCnpj: { contains: termo, mode: 'insensitive' } },
              ],
            },
            take: 5,
          })
        : Promise.resolve([]),

      prisma.inquilino.findMany({
        where: {
          OR: [
            { nome: { contains: termo, mode: 'insensitive' } },
            { email: { contains: termo, mode: 'insensitive' } },
            { cpf: { contains: termo, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),

      prisma.contrato.findMany({
        where: {
          OR: [
            { inquilino: { nome: { contains: termo, mode: 'insensitive' } } },
            { locador: { nome: { contains: termo, mode: 'insensitive' } } },
          ],
        },
        include: { inquilino: true, locador: true },
        take: 5,
      }),

      prisma.kitnet.findMany({
        where: {
          OR: [
            { numero: { contains: termo, mode: 'insensitive' } },
            { nome: { contains: termo, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),

      prisma.unidade.findMany({
        where: {
          OR: [
            { nome: { contains: termo, mode: 'insensitive' } },
            { cidade: { contains: termo, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),

      isAdmin
        ? prisma.usuario.findMany({
            where: {
              OR: [
                { nome: { contains: termo, mode: 'insensitive' } },
                { email: { contains: termo, mode: 'insensitive' } },
              ],
            },
            take: 5,
          })
        : Promise.resolve([]),

    ]);

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
