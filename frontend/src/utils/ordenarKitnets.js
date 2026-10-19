// Kitnet.numero é string ("01", "02"...) -- a API devolve as kitnets
// na ordem de criação, não por número, então toda lista/seleção de
// kitnet no sistema precisa reordenar antes de mostrar (senão vira
// "17, 13, 12... 01, 02, 03" em vez de "01, 02, 03...").
export function ordenarPorNumero(kitnets) {

  return [...(kitnets || [])].sort((a, b) => {

    const na = Number(a.numero);
    const nb = Number(b.numero);

    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;

    return String(a.numero).localeCompare(String(b.numero), undefined, {
      numeric: true,
      sensitivity: "base",
    });

  });

}
