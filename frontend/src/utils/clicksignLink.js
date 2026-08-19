import { ClicksignService } from "@/services/clicksign.service";

// Busca o documento na Clicksign e monta a melhor URL pra abrir: o link
// de assinatura do signatário pendente (se houver) ou, senão, a página
// do documento no painel deles (accounts/.../documents/:id).
export async function obterLinkClicksign(id) {

  const resposta = await ClicksignService.buscarDocumento(id);

  const documento = resposta?.data?.document || resposta?.document;

  if (!documento) return "https://app.clicksign.com";

  const signatarioPendente = (documento.signers || []).find(
    (s) => s.url && !s.signature
  );

  if (signatarioPendente?.url) {
    return signatarioPendente.url;
  }

  if (documento.links?.self) {
    return `https://app.clicksign.com${documento.links.self}`;
  }

  return "https://app.clicksign.com";

}
