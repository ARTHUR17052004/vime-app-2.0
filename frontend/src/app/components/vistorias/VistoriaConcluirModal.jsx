"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, NotebookPen } from "lucide-react";

import { Clock, TriangleAlert } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import SeletorMidia from "../ui/SeletorMidia";
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
  // Só true se o usuário mexeu manualmente no seletor -- nesse caso é
  // uma data escolhida (ex.: "esqueci de registrar ontem"), sem hora
  // real pra capturar. Se não mexer (ficou na data de hoje, valor
  // padrão), manda o instante exato de agora, com hora de verdade.
  const [dataAlterada, setDataAlterada] = useState(false);
  const [midias, setMidias] = useState([]);
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Vistoria "Geral" (sem residência fixa) vira um "mundo com várias
  // missões" -- uma por residência ativa do sistema -- em vez de
  // concluir tudo de uma vez. Cada residência tem seu PRÓPRIO relógio:
  // marcar a VIME I como feita hoje já reprograma só ela, sem esperar
  // as outras.
  const isGeral = !vistoria?.unidadeId;

  const [missoes, setMissoes] = useState(null);
  const [carregandoMissoes, setCarregandoMissoes] = useState(false);
  const [selecionadas, setSelecionadas] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(new Date().toISOString().split("T")[0]);
      setDataAlterada(false);
      setMidias([]);
      setObservacoes("");
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

  // Data não mexida (ficou em "hoje"): manda o instante exato de agora,
  // com hora real. Data escolhida manualmente: meio-dia daquele dia --
  // nunca meia-noite, pra um fuso atrás de UTC (Brasil) não "voltar" um
  // dia na conversão de exibição depois.
  const dataRealizacaoParaEnviar = () =>
    dataAlterada ? `${data}T12:00:00` : new Date().toISOString();

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
          dataRealizacao: dataRealizacaoParaEnviar(),
          fotos: midias,
          realizadoPor: vistoria.responsavel || null,
          observacoes: observacoes || null,
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
      dataUltima: dataRealizacaoParaEnviar(),
      fotosConclusao: midias,
      observacoesConclusao: observacoes || null,
    });

  };

  const totalEmDia = missoes?.residencias.filter((r) => !r.atrasada).length || 0;

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
            onChange={(e) => {
              setData(e.target.value);
              setDataAlterada(true);
            }}
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
                  {totalEmDia} de {missoes.residencias.length} residências em dia -- cada uma reprograma sozinha, na hora, quando marcada.
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {missoes.residencias.map((r) => (
                    <label
                      key={r.unidadeId}
                      className={`
                        flex items-center gap-3 rounded-xl border px-4 py-3 transition cursor-pointer
                        ${
                          selecionadas.has(r.unidadeId)
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-[var(--border-token)] bg-[var(--surface-2)] hover:border-emerald-500/40"
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selecionadas.has(r.unidadeId)}
                        onChange={() => alternarSelecionada(r.unidadeId)}
                        className="w-4 h-4 accent-emerald-500"
                      />

                      <div className="flex-1">
                        <span className="text-[var(--text)]">{r.unidadeNome}</span>
                        {r.dataUltima && (
                          <p className="text-xs text-[var(--text-faint)]">
                            Última vez: {formatDate(r.dataUltima)}
                          </p>
                        )}
                      </div>

                      {r.dataProxima && (
                        r.atrasada ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400">
                            <TriangleAlert size={14} />
                            Atrasada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-[var(--text-faint)]">
                            <Clock size={14} />
                            {formatDate(r.dataProxima)}
                          </span>
                        )
                      )}
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

          <SeletorMidia
            accept="image/*,video/*"
            multiple
            onArquivos={handleArquivos}
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

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] mb-2">
            <NotebookPen size={16} />
            Observações (opcional)
          </label>

          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            placeholder="Algo a registrar sobre essa vistoria..."
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
              outline-none
              focus:border-emerald-500
              resize-none
            "
          />
        </div>

        {/* Fixo embaixo do modal (não rola junto com o conteúdo) --
            padrão do sistema no mobile: botão de enviar sempre visível,
            com Cancelar logo abaixo dele. */}
        <div
          className="
            sticky bottom-0 -mx-8 -mb-8 mt-2
            flex flex-col-reverse sm:flex-row sm:justify-end
            gap-3
            border-t border-[var(--border-token)]
            bg-[var(--surface)]
            px-8 py-5
          "
        >
          <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
            Cancelar
          </Button>

          <Button className="w-full sm:w-auto" onClick={handleConfirmar} disabled={enviando}>
            {isGeral ? "Confirmar Residências Vistoriadas" : "Confirmar Realização"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
