"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, FileWarning } from "lucide-react";

// Boleto já enviado ao banco -- linkBoleto/linhaDigitavel/pixCopiaECola
// só existem depois do "Enviar Cobrança" dar certo (ver
// gatewayPagamentoService). Serve pra pegar o boleto/Pix na mão e
// mandar manualmente (ex.: WhatsApp, e-mail) quando o envio automático
// pro inquilino falhar por algum motivo -- sem precisar reemitir nada.
function CampoCopiavel({ rotulo, valor }) {

  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // clipboard pode falhar (navegador antigo, http sem https) --
      // sem travar a tela, só não copia sozinho.
    }
  };

  return (
    <div>
      <label className="block text-xs text-[var(--text-faint)] mb-1.5">
        {rotulo}
      </label>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={valor}
          onFocus={(e) => e.target.select()}
          className="flex-1 min-w-0 border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 text-sm font-mono truncate"
        />
        <button
          type="button"
          onClick={copiar}
          title="Copiar"
          className="shrink-0 w-11 h-11 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] flex items-center justify-center hover:bg-[var(--surface-3)] transition"
        >
          {copiado ? (
            <Check size={18} className="text-emerald-400" />
          ) : (
            <Copy size={18} className="text-[var(--text-muted)]" />
          )}
        </button>
      </div>
      {copiado && (
        <p className="text-xs text-emerald-400 mt-1.5">Copiado!</p>
      )}
    </div>
  );

}

export default function ReceitaBoletoModal({ isOpen, onClose, receita }) {

  if (!isOpen || !receita) return null;

  const temBoleto = Boolean(receita.linkBoleto || receita.linhaDigitavel || receita.pixCopiaECola);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--surface-inset)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="min-h-full flex items-center justify-center">
        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl shadow-[0_18px_45px_rgba(0,0,0,.35)] w-full max-w-lg p-8 relative">

          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-2xl text-[var(--text-subtle)]"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
            Boleto
          </h2>
          <p className="text-sm text-[var(--text-subtle)] mb-8">
            {receita.descricao}
            {receita.gatewayProvider ? ` -- via ${receita.gatewayProvider}` : ""}
          </p>

          {!temBoleto ? (

            <div className="flex items-start gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-sm text-yellow-300">
              <FileWarning size={20} className="shrink-0 mt-0.5" />
              <p>
                Essa receita ainda não tem boleto gerado -- use &quot;Enviar Cobrança&quot; na lista primeiro.
              </p>
            </div>

          ) : (

            <div className="space-y-5">

              {receita.pixCopiaECola && (
                <CampoCopiavel rotulo="Pix Copia e Cola" valor={receita.pixCopiaECola} />
              )}

              {receita.linhaDigitavel && (
                <CampoCopiavel rotulo="Linha digitável" valor={receita.linhaDigitavel} />
              )}

              {receita.linkBoleto && (
                <a
                  href={receita.linkBoleto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-emerald-700 hover:bg-emerald-600 transition text-white font-semibold rounded-xl py-3"
                >
                  <ExternalLink size={18} />
                  Abrir / Baixar PDF do boleto
                </a>
              )}

              <p className="text-xs text-[var(--text-faint)]">
                Esse é o mesmo boleto já emitido no banco -- abrir ou copiar aqui não gera (nem cobra) nada de novo.
              </p>

            </div>

          )}

        </div>
      </div>
    </div>
  );

}
