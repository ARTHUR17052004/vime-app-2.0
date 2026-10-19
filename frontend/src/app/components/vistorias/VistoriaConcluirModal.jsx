"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, CheckCircle2 } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { formatDate } from "@/utils/formatDate";
import { lerArquivoComoDataUrl, tamanhoTotalMB } from "@/utils/arquivoMidia";
import { VistoriaService } from "@/services/vistoria.service";

export default function VistoriaConcluirModal({
  isOpen,
  onClose,
  vistoria,
  onConfirm,
  onMissoesConcluidas,
}) {
  const [data, setData] = useState("");
  const [midias, setMidias] = useState([]);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Vistoria "Geral" (sem residência fixa) vira um "mundo com várias
  // missões" -- uma por residência ativa do sistema -- em vez de
  // concluir tudo de uma vez. O mundo só fecha (e renova pra próxima
  // data) quando todas as missões do ciclo forem batidas.
  const isGeral = !vistoria?.unidadeId;

  const [missoes, setMissoes] = useState(null);
  const [carregandoMissoes, setCarregandoMissoes] = useState(false);
  const [selecionadas, setSelecionadas] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(new Date().toISOString().split("T")[0]);
      setMidias([]);
      setErro("");
      setSelecionadas(new Set());
      setMissoes(null);
    }
  }, [isOpen]);

  useEffect(() => {

    async function carregarMissoes() {

      if (!isOpen || !isGeral || !vistoria?.id) return;

      try {
        setCarregandoMissoes(true);
        const resposta = await VistoriaService.listarMissoes(vistoria.id);
        setMissoes(resposta);
      } catch (err) {
        setErro(err.message || "Erro ao carregar o checklist de residências.");
      } finally {
        setCarregandoMissoes(false);
      }

    }

    carregarMissoes();

  }, [isOpen, isGeral, vistoria?.id]);

  const alternarSelecionada = (unidadeId) => {
    setSelecionadas((prev) => {
      const nova = new Set(prev);
      if (nova.has(unidadeId)) nova.delete(unidadeId);
      else nova.add(unidadeId);
      return nova;
    });
  };

  const handleArquivos = async (e) => {
    const arquivos = Array.from(e.target.files || []);
    e.target.value = "";

    let totalAtualMB = tamanhoTotalMB(midias);

    for (const arquivo of arquivos) {
      try {
        const dataUrl = await lerArquivoComoDataUrl(arquivo, { totalAtualMB });
        totalAtualMB += arquivo.size / 1024 / 1024;
        setMidias((prev) => [...prev, dataUrl]);
      } catch (erro) {
        setErro(erro.message);
        break;
      }
    }
  };

  const handleConfirmar = async () => {

    if (isGeral) {

      if (selecionadas.size === 0) {
        setErro("Selecione ao menos uma residência que foi vistoriada.");
        return;
      }

      try {

        setEnviando(true);
        setErro("");

        await VistoriaService.concluirMissoes(vistoria.id, {
          unidadeIds: [...selecionadas],
          dataRealizacao: data,
          fotos: midias,
          realizadoPor: vistoria.responsavel || null,
        });

        onMissoesConcluidas?.();

      } catch (err) {

        setErro(err.message || "Erro ao registrar as residências vistoriadas.");

      } finally {

        setEnviando(false);

      }

      return;

    }

    onConfirm({
      dataUltima: data,
      fotosConclusao: midias,
    });

  };

  const totalConcluidas = missoes?.residencias.filter((r) => r.concluida).length || 0;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Registrar Vistoria Realizada"
      subtitle={vistoria?.nomeVistoria}
      size="md"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
            Data em que foi realizada
          </label>

          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="
              w-full
              rounded-xl
              border
              border-[var(--border-token)]
              bg-[var(--surface-2)]
              px-4
              py-3
              text-[var(--text)]
              outline-none
              focus:border-emerald-500
            "
          />

          {data && (
            <p className="text-xs text-[var(--text-faint)] mt-2">
              Será registrada como {formatDate(data)}
            </p>
          )}
        </div>

        {isGeral && (
          <div>
            <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
              Quais residências você vistoriou?
            </label>

            {carregandoMissoes && (
              <p className="text-sm text-[var(--text-faint)]">Carregando checklist...</p>
            )}

            {missoes && (
              <>
                <p className="text-xs text-[var(--text-faint)] mb-3">
                  {totalConcluidas} de {missoes.residencias.length} residências já concluídas neste ciclo.
                  {totalConcluidas + selecionadas.size >= missoes.residencias.length && (
                    <span className="text-emerald-400 font-semibold">
                      {" "}Vai fechar o ciclo e já marcar a próxima data!
                    </span>
                  )}
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {missoes.residencias.map((r) => (
                    <label
                      key={r.unidadeId}
                      className={`
                        flex items-center gap-3 rounded-xl border px-4 py-3 transition
                        ${
                          r.concluida
                            ? "border-emerald-500/30 bg-emerald-500/5 opacity-70"
                            : "border-[var(--border-token)] bg-[var(--surface-2)] cursor-pointer hover:border-emerald-500/40"
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={r.concluida || selecionadas.has(r.unidadeId)}
                        disabled={r.concluida}
                        onChange={() => alternarSelecionada(r.unidadeId)}
                        className="w-4 h-4 accent-emerald-500"
                      />

                      <span className="flex-1 text-[var(--text)]">{r.unidadeNome}</span>

                      {r.concluida && <CheckCircle2 size={16} className="text-emerald-400" />}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] mb-2">
            <ImageIcon size={16} />
            Fotos e vídeos da execução (opcional)
          </label>

          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleArquivos}
            className="
              w-full
              rounded-xl
              border
              border-[var(--border-token)]
              bg-[var(--surface-2)]
              px-4
              py-3
              text-[var(--text)]
              text-sm
            "
          />

          {midias.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {midias.map((midia, index) =>
                midia.startsWith("data:video") ? (
                  <video
                    key={index}
                    src={midia}
                    controls
                    className="w-full h-24 object-cover rounded-xl border border-[var(--border-token)]"
                  />
                ) : (
                  <img
                    key={index}
                    src={midia}
                    alt={`Mídia ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl border border-[var(--border-token)]"
                  />
                )
              )}
            </div>
          )}

          {erro && (
            <p className="mt-3 text-sm text-red-400">{erro}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button onClick={handleConfirmar} disabled={enviando}>
            {isGeral ? "Confirmar Residências Vistoriadas" : "Confirmar Realização"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
