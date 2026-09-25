"use client";

import { useEffect, useState, useCallback } from "react";
import { Fingerprint, Trash2 } from "lucide-react";

import DashboardCard from "../dashboard/DashboardCard";
import Button from "../ui/Button";

import { BiometriaService } from "../../../services/biometria.service";

// Cadastro do login por digital/rosto. Só aparece em aparelho que tem
// biometria configurada (celular, ou computador com Windows Hello).
export default function BiometriaCard() {

  const [suportado, setSuportado] = useState(false);
  const [credenciais, setCredenciais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setCredenciais(await BiometriaService.listar());
    } catch (e) {
      setCredenciais([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    BiometriaService.suportado().then(setSuportado);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  async function ativar() {

    setOcupado(true);
    setMensagem(null);

    try {
      await BiometriaService.cadastrar(nomeDoAparelho());
      await carregar();
      setMensagem({ tipo: "ok", texto: "Pronto! Da próxima vez é só usar a digital pra entrar." });
    } catch (erro) {
      setMensagem({ tipo: "erro", texto: erro.message });
    } finally {
      setOcupado(false);
    }

  }

  async function remover(id) {

    setOcupado(true);

    try {
      await BiometriaService.remover(id);
      const restantes = credenciais.filter((c) => c.id !== id);
      setCredenciais(restantes);
      if (restantes.length === 0) BiometriaService.esquecerAparelho();
    } catch (erro) {
      setMensagem({ tipo: "erro", texto: erro.message });
    } finally {
      setOcupado(false);
    }

  }

  if (carregando) return null;

  return (
    <DashboardCard>

      <p className="text-xs uppercase tracking-[0.35em] text-emerald-400 font-semibold">
        Acesso rápido
      </p>

      <h2 className="mt-2 text-2xl font-bold text-[var(--text)]">
        Entrar com digital
      </h2>

      <p className="mt-2 text-sm text-[var(--text-subtle)]">
        Use a digital ou o rosto do seu aparelho pra entrar no VIME, como nos outros apps.
        A biometria fica só no seu aparelho -- o sistema nunca a recebe.
      </p>

      {!suportado && (
        <p className="mt-5 text-sm text-yellow-300">
          Este aparelho não tem digital/rosto configurado (ou o navegador não suporta).
          Configure nas opções de segurança do celular e volte aqui.
        </p>
      )}

      {suportado && (
        <div className="mt-6">
          <Button onClick={ativar} loading={ocupado} leftIcon={<Fingerprint size={18} />}>
            {credenciais.length ? "Cadastrar outro aparelho" : "Ativar digital neste aparelho"}
          </Button>
        </div>
      )}

      {mensagem && (
        <p className={`mt-4 text-sm ${mensagem.tipo === "ok" ? "text-emerald-400" : "text-red-400"}`}>
          {mensagem.texto}
        </p>
      )}

      {credenciais.length > 0 && (
        <ul className="mt-6 space-y-3">
          {credenciais.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] px-5 py-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[var(--text)] truncate">
                  {c.nome || "Aparelho"}
                </p>
                <p className="text-xs text-[var(--text-subtle)]">
                  Cadastrado em {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <button
                onClick={() => remover(c.id)}
                disabled={ocupado}
                aria-label="Remover digital"
                className="text-red-400 hover:text-red-300 transition disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

    </DashboardCard>
  );
}

function nomeDoAparelho() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (/android/i.test(ua)) return "Celular Android";
  if (/iphone|ipad/i.test(ua)) return "iPhone/iPad";
  if (/windows/i.test(ua)) return "Computador Windows";
  if (/mac/i.test(ua)) return "Mac";
  return "Aparelho";
}
