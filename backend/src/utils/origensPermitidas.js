// Origens (front-ends) autorizadas: CORS, socket e WebAuthn usam a mesma lista.
const origensPadrao = [
  "http://localhost:3000",
  "https://vimesistema.online",
  "https://www.vimesistema.online",
];

const origensPermitidas = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : origensPadrao;

module.exports = { origensPermitidas };
