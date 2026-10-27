"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, User, Plus, Search, History, TrendingUp, Clock, AlertTriangle, Wallet } from "lucide-react";

import { SabadoService } from "@/services/sabado.service";
import { useAuth } from "../../../context/AuthContext";
import { formatCurrency } from "@/utils/formatCurrency";

// "Hoje 08:21" / "Ontem" / "25/10" -- igual qualquer chat de IA
// comum, sem repetir a data inteira pra conversa de hoje.
function formatarQuando(data) {

  const d = new Date(data);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);

  const mesmoDia = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (mesmoDia(d, hoje)) {
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  if (mesmoDia(d, ontem)) return "Ontem";

  return d.toLocaleDateString("pt-BR").slice(0, 5);

}

// Visual de cada cartão financeiro -- a cor é só semântica (recebido
// em verde, vencido em vermelho...), os NÚMEROS vêm sempre do
// visao_geral de verdade (ver sabadoService.js), nunca escritos aqui.
const CARTAO_VISUAL = {
  recebido_periodo: { icone: TrendingUp, cor: "emerald" },
  previsto_periodo: { icone: Clock, cor: "sky" },
  cobrancas_vencidas: { icone: AlertTriangle, cor: "red" },
  cobrancas_a_vencer: { icone: Clock, cor: "amber" },
  pagamentos_pendentes: { icone: Wallet, cor: "amber" },
};

const CORES = {
  emerald: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  sky: { bg: "bg-sky-500/15", text: "text-sky-400" },
  red: { bg: "bg-red-500/15", text: "text-red-400" },
  amber: { bg: "bg-amber-500/15", text: "text-amber-400" },
};

function formatarValorCartao(cartao) {
  if (cartao.formato === "moeda") return formatCurrency(cartao.valor);
  if (cartao.formato === "percentual") return `${cartao.valor}%`;
  return String(cartao.valor);
}

function CartoesFinanceiro({ cards }) {

  if (!cards?.length) return null;

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {cards.map((c) => {

        const visual = CARTAO_VISUAL[c.chave] || { icone: TrendingUp, cor: "emerald" };
        const Icone = visual.icone;
        const cores = CORES[visual.cor];

        return (
          <div key={c.chave} className="rounded-xl border border-[var(--border-token)] bg-[var(--surface)] p-3">

            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${cores.bg} ${cores.text}`}>
              <Icone size={14} />
            </div>

            <p className="text-[11px] text-[var(--text-faint)] leading-tight">{c.rotulo}</p>
            <p className="text-sm font-bold text-[var(--text)] mt-0.5">{formatarValorCartao(c)}</p>

            {c.comparacao?.variacaoPercentual !== null && c.comparacao?.variacaoPercentual !== undefined && (
              <p className="text-[10px] text-[var(--text-faint)] mt-0.5">
                {c.comparacao.variacaoPercentual >= 0 ? "+" : ""}
                {c.comparacao.variacaoPercentual}% vs. período anterior
              </p>
            )}

          </div>
        );

      })}
    </div>
  );

}

export default function AssistenteChat() {
  const { usuario } = useAuth();

  const [mensagens, setMensagens] = useState([]);
  const [conversaAtualId, setConversaAtualId] = useState(null);
  const [conversas, setConversas] = useState([]);
  const [busca, setBusca] = useState("");
  const [historicoAberto, setHistoricoAberto] = useState(false);

  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [carregandoConversa, setCarregandoConversa] = useState(false);
  const [erro, setErro] = useState("");

  const fimRef = useRef(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, enviando]);

  const carregarConversas = async (termo) => {
    try {
      const resposta = await SabadoService.listarConversas(termo);
      setConversas(resposta.data);
    } catch {
      // histórico é um extra -- não trava o chat se falhar em carregar.
    }
  };

  useEffect(() => {
    carregarConversas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => carregarConversas(busca), 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  const novoChat = () => {
    setConversaAtualId(null);
    setMensagens([]);
    setErro("");
    setHistoricoAberto(false);
  };

  const abrirConversa = async (id) => {

    if (id === conversaAtualId) return;

    setCarregandoConversa(true);
    setErro("");

    try {

      const resposta = await SabadoService.buscarConversa(id);

      setConversaAtualId(id);
      setMensagens(resposta.data.mensagens.map((m) => ({ role: m.role, content: m.conteudo })));
      setHistoricoAberto(false);

    } catch (err) {

      setErro(err.message || "Não foi possível abrir essa conversa.");

    } finally {

      setCarregandoConversa(false);

    }

  };

  const enviarPergunta = async () => {

    const texto = pergunta.trim();

    if (!texto || enviando) return;

    setMensagens((prev) => [...prev, { role: "user", content: texto }]);
    setPergunta("");
    setErro("");
    setEnviando(true);

    try {

      const resposta = await SabadoService.chat({ conversaId: conversaAtualId, mensagem: texto });

      setMensagens((prev) => [
        ...prev,
        { role: "assistant", content: resposta.data.texto, cards: resposta.data.cards },
      ]);
      setConversaAtualId(resposta.data.conversaId);
      carregarConversas(busca);

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

  const primeiroNome = usuario?.nome?.trim().split(" ")[0] || "";

  return (
    <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] p-5 sm:p-6">

      <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--border-token)]">

        <div className="flex items-center gap-3 min-w-0">

          <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Sparkles size={20} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
              Assistente VIME
              <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Beta
              </span>
            </p>
            <p className="text-xs text-[var(--text-faint)] truncate">
              Converse sobre os dados reais do sistema -- nunca inventa número.
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2 shrink-0">

          <button
            onClick={() => setHistoricoAberto((v) => !v)}
            className="lg:hidden flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] px-3 py-1.5 rounded-lg border border-[var(--border-token)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <History size={14} />
            Histórico
          </button>

          <button
            onClick={novoChat}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-400/30 hover:bg-emerald-400/10 transition-colors"
          >
            <Plus size={14} />
            Novo chat
          </button>

        </div>

      </div>

      <div className="flex flex-col lg:flex-row gap-5 h-[65vh]">

        <div className="flex-1 min-w-0 flex flex-col">

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">

            {mensagens.length === 0 && !carregandoConversa && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 px-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  {primeiroNome ? `Olá, ${primeiroNome}!` : "Olá!"}
                </p>
                <p className="text-sm text-[var(--text-faint)] max-w-sm">
                  Pergunte algo como &quot;me mostre um resumo financeiro desse mês&quot; ou &quot;quantas vistorias estão atrasadas?&quot;
                </p>
              </div>
            )}

            {carregandoConversa && (
              <p className="text-sm text-[var(--text-faint)] text-center mt-6">Carregando conversa...</p>
            )}

            {!carregandoConversa && mensagens.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>

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
                    max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed
                    ${
                      m.role === "user"
                        ? "bg-sky-500/10 border border-sky-500/20 text-[var(--text)]"
                        : "bg-[var(--surface-2)] border border-[var(--border-token)] text-[var(--text)]"
                    }
                  `}
                >
                  {m.content}
                  <CartoesFinanceiro cards={m.cards} />
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

            {erro && <p className="text-xs text-red-400">{erro}</p>}

            <div ref={fimRef} />

          </div>

          <div className="mt-4 flex items-end gap-2 border-t border-[var(--border-token)] pt-4">

            <textarea
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Digite sua pergunta..."
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

          <p className="mt-2 text-[11px] text-[var(--text-faint)] text-center">
            A IA pode cometer erros. Sempre confira informações importantes.
          </p>

        </div>

        <div
          className={`
            ${historicoAberto ? "flex" : "hidden"} lg:flex
            flex-col w-full lg:w-72 shrink-0
            lg:border-l lg:border-[var(--border-token)] lg:pl-5
          `}
        >

          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-[var(--text-muted)]">Histórico</h4>
          </div>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar conversas..."
              className="
                w-full
                rounded-lg
                border
                border-[var(--border-token)]
                bg-[var(--surface-2)]
                pl-9
                pr-3
                py-2
                text-xs
                text-[var(--text)]
                outline-none
                focus:border-emerald-500
              "
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">

            {conversas.length === 0 && (
              <p className="text-xs text-[var(--text-faint)] px-1">Nenhuma conversa ainda.</p>
            )}

            {conversas.map((c) => (
              <button
                key={c.id}
                onClick={() => abrirConversa(c.id)}
                className={`
                  w-full text-left rounded-xl px-3 py-2.5 transition-colors
                  ${
                    c.id === conversaAtualId
                      ? "bg-emerald-500/10 border border-emerald-500/30"
                      : "border border-transparent hover:bg-[var(--surface-2)]"
                  }
                `}
              >
                <p className="text-sm font-medium text-[var(--text)] truncate">{c.titulo}</p>
                <p className="text-xs text-[var(--text-faint)] mt-0.5">{formatarQuando(c.updatedAt)}</p>
              </button>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}
