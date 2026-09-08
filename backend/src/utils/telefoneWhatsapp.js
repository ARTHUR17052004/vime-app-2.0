/*
  Normalização de telefone compartilhada por tudo que fala com a Meta
  Cloud API (envio de mensagem/modelo e webhook de recebimento).

  Dois problemas reais, resolvidos aqui:

  1) O cadastro de Inquilino grava o telefone local, sem código do
     país (ex: "62993711712"), mas a Cloud API exige o número
     completo (código do país + DDD + número). `paraEnvio()` completa
     isso quando reconhece um número local.

  2) Pegadinha de celular brasileiro: a Meta às vezes devolve o número
     de quem respondeu SEM o "9" extra do celular (ex: recebemos de
     "556293711712"), mesmo quando mandamos PARA "5562993711712" (com
     o 9). Sem tratar isso, a mesma pessoa vira dois contatos
     diferentes no sistema -- um criado quando a gente manda, outro
     quando ela responde. `paraChave()` sempre remove esse 9 extra
     (quando presente), então os dois formatos caem na mesma chave.
*/

function apenasDigitos(valor) {
  return (valor || "").replace(/\D/g, "");
}

// Sempre com "55" na frente -- string pronta pro campo "to" da API.
function paraEnvio(telefone) {

  let d = apenasDigitos(telefone);

  if (d.length <= 11 && !d.startsWith("55")) {
    d = "55" + d;
  }

  return d;

}

// Chave canônica pra identificar/agrupar contatos -- 55 + DDD + 8
// dígitos do número local, sem o 9 extra do celular (quando presente).
function paraChave(telefone) {

  let d = paraEnvio(telefone);

  // 55 (2) + DDD (2) + local de 9 dígitos começando com 9 (celular
  // novo formato) = 13 dígitos no total, com "9" logo na posição 4.
  if (d.length === 13 && d[4] === "9") {
    d = d.slice(0, 4) + d.slice(5);
  }

  return d;

}

module.exports = {
  paraEnvio,
  paraChave,
};
