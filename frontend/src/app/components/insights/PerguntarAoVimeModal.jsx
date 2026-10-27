"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, User } from "lucide-react";

import Modal from "../ui/Modal";
import { SabadoService } from "@/services/sabado.service";

export default function PerguntarAoVimeModal({ isOpen, onClose }) {
  const [mensagens, setMensagens] = useState([]);
  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const fimRef = useRef(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, enviando]);

  const enviarPergunta = async () => {

    const texto = pergunta.trim();

    if (!texto || enviando) return;

    const historico = [...mensagens, { role: "user", content: texto }];

    setMensagens(historico);
    setPergunta("");
    setErro("");
    setEnviando(true);

    try {

      const resposta = await SabadoService.chat(historico);

      setMensagens((prev) => [...prev, { role: "assistant", content: resposta.data.texto }]);

    } catch (err) {

      setErro(err.message || "O SABADO não conseguiu responder agora.");

    } finally {

      setEnviando(false);

    }

  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarPergunta();
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Pergunte ao VIME"
      subtitle="Converse com o SABADO sobre os dados reais do sistema -- ele só explica o que já está cadastrado, nunca inventa número."
      size="md"
      scrollable={false}
    >
      <div className="flex flex-col h-[60vh]">

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">

          {mensagens.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-[var(--text-faint)]">
              <Sparkles size={28} className="text-emerald-400" />
              <p className="text-sm max-w-xs">
                Pergunte algo como &quot;quais contratos vencem esse mês?&quot; ou &quot;quantas vistorias estão atrasadas?&quot;
              </p>
            </div>
          )}

          {mensagens.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`
                  w-8 h-8 shrink-0 rounded-lg flex items-center justify-center
                  ${m.role === "user" ? "bg-sky-500/15 text-sky-400" : "bg-emerald-500/15 text-emerald-400"}
                `}
              >
                {m.role === "user" ? <User size={16} /> : <Sparkles size={16} />}
              </div>

              <div
                className={`
                  max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed
                  ${
                    m.role === "user"
                      ? "bg-sky-500/10 border border-sky-500/20 text-[var(--text)]"
                      : "bg-[var(--surface-2)] border border-[var(--border-token)] text-[var(--text)]"
                  }
                `}
              >
                {m.content}
              </div>
            </div>
          ))}

          {enviando && (
            <div className="flex gap-3">
              <div className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center bg-emerald-500/15 text-emerald-400">
                <Sparkles size={16} />
              </div>
              <div className="rounded-2xl px-4 py-3 text-sm bg-[var(--surface-2)] border border-[var(--border-token)] text-[var(--text-faint)]">
                Consultando os dados...
              </div>
            </div>
          )}

          {erro && (
            <p className="text-xs text-red-400">{erro}</p>
          )}

          <div ref={fimRef} />

        </div>

        <div className="mt-4 flex items-end gap-2 border-t border-[var(--border-token)] pt-4">

          <textarea
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Pergunte algo sobre o sistema..."
            disabled={enviando}
            className="
              flex-1
              resize-none
              rounded-xl
              border
              border-[var(--border-token)]
              bg-[var(--surface-2)]
              px-4
              py-3
              text-sm
              text-[var(--text)]
              outline-none
              focus:border-emerald-500
              disabled:opacity-60
            "
          />

          <button
            onClick={enviarPergunta}
            disabled={enviando || !pergunta.trim()}
            className="
              flex items-center justify-center
              w-11 h-11 shrink-0 rounded-xl
              bg-emerald-500 text-black
              hover:bg-emerald-400
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <Send size={18} />
          </button>

        </div>

      </div>
    </Modal>
  );
}
