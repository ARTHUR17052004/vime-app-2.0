const paraDataOuNull = (valor) => {
  if (valor === undefined) return undefined;
  if (valor === null || valor === "") return null;
  return new Date(valor);
};

module.exports = {
  paraDataOuNull
};
