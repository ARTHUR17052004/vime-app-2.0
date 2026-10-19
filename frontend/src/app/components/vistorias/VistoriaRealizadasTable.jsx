"use client";

import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, NotebookPen } from "lucide-react";

import Table from "../ui/Table";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import VistoriaMissaoActionsMenu from "./VistoriaMissaoActionsMenu";
import { VistoriaService } from "@/services/vistoria.service";
import { formatDateTime } from "@/utils/formatDate";
import { lerArquivoComoDataUrl, tamanhoTotalMB } from "@/utils/arquivoMidia";

// Junta as duas fontes de "realizada" que existem no sistema: cada
// missão de uma vistoria "Geral" (uma por residência/ciclo -- registro
// à parte, dá pra editar/excluir) e a última execução registrada de
// uma vistoria normal (concluidaEm -- é um campo dela mesma, só dá
// pra ver).
export default function VistoriaRealizadasTable({
  vistorias = [],
  filtroVistoriaId = null,
  onLimparFiltro,
  onRecarregarVistorias,
}) {

  const [missoesRealizadas, setMissoesRealizadas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [detalhe, setDetalhe] = useState(null);
  const [editando, setEditando] = useState(null);

  const carregarMissoes = async () => {

    try {
      const resposta = await VistoriaService.listarArquivoMissoes();
      setMissoesRealizadas(Array.isArray(resposta) ? resposta : []);
    } catch (err) {
      console.error("Erro ao carregar vistorias realizadas:", err);
    } finally {
      setCarregando(false);
    }

  };

  useEffect(() => {
    carregarMissoes();
  }, []);

  const linhas = useMemo(() => {

    const deMissoes = missoesRealizadas.map((m) => ({
      tipo: "missao",
      missaoId: m.id,
      vistoriaId: m.vistoriaId,
      vistoria: m.vistoria?.titulo || "-",
      residencia: m.unidade?.nome || "-",
      ciclo: m.ciclo,
      dataHora: m.dataRealizacao,
      responsavel: m.realizadoPor || "-",
      fotos: m.fotos || [],
      observacoes: m.observacoes || "",
    }));

    const deRegulares = vistorias
      .filter((v) => v.unidadeId && v.concluidaEm)
      .map((v) => ({
        tipo: "regular",
        vistoriaId: v.id,
        vistoria: v.nomeVistoria,
        residencia: v.unidadeNome,
        ciclo: "-",
        dataHora: v.concluidaEm,
        responsavel: v.responsavel || "-",
        fotos: v.fotosConclusao || [],
        observacoes: v.observacoesConclusao || "",
      }));

    return [...deMissoes, ...deRegulares]
      .filter((item) => !filtroVistoriaId || item.vistoriaId === filtroVistoriaId)
      .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

  }, [missoesRealizadas, vistorias, filtroVistoriaId]);

  const excluirMissao = async (item) => {

    const confirmar = window.confirm(
      `Excluir o registro de "${item.residencia}" (${item.vistoria})? A residência volta a aparecer como pendente neste ciclo.`
    );

    if (!confirmar) return;

    try {
      await VistoriaService.excluirMissao(item.vistoriaId, item.missaoId);
      await carregarMissoes();
    } catch (err) {
      alert(err.message || "Erro ao excluir o registro.");
    }

  };

  const cancelarRealizacao = async (item) => {

    const confirmar = window.confirm(
      `Cancelar a realização de "${item.vistoria}" (${item.residencia})? Ela volta a ficar como estava antes de marcar "Realizar".`
    );

    if (!confirmar) return;

    try {
      await VistoriaService.cancelarRealizacao(item.vistoriaId);
      await onRecarregarVistorias?.();
    } catch (err) {
      alert(err.message || "Erro ao cancelar a realização.");
    }

  };

  const colunas = [
    { key: "vistoria", title: "Vistoria" },
    { key: "residencia", title: "Residência" },
    { key: "ciclo", title: "Ciclo" },
    { key: "dataHora", title: "Data/Hora Realizada", render: (item) => formatDateTime(item.dataHora) },
    { key: "responsavel", title: "Responsável" },
    {
      key: "fotos",
      title: "Fotos",
      render: (item) => (
        item.fotos?.length > 0
          ? (
            <span className="inline-flex items-center gap-1 text-[var(--text-subtle)]">
              <ImageIcon size={14} />
              {item.fotos.length}
            </span>
          )
          : "-"
      ),
    },
    {
      key: "acoes",
      title: "",
      render: (item) => (
        <VistoriaMissaoActionsMenu
          item={item}
          onVer={setDetalhe}
          onEditar={setEditando}
          onExcluir={excluirMissao}
          onCancelarRealizacao={cancelarRealizacao}
        />
      ),
    },
  ];

  return (

    <div className="space-y-4">

      {filtroVistoriaId && (
        <p className="text-sm text-[var(--text-subtle)]">
          Mostrando só <strong className="text-[var(--text)]">{linhas[0]?.vistoria || "uma vistoria"}</strong>.
          {" "}
          <button onClick={onLimparFiltro} className="text-emerald-400 hover:underline">
            Ver todas
          </button>
        </p>
      )}

      <Table
        columns={colunas}
        data={linhas}
        loading={carregando}
        emptyMessage="Nenhuma vistoria realizada ainda."
      />

      <DetalheModal item={detalhe} onClose={() => setDetalhe(null)} />

      <EditarModal
        item={editando}
        onClose={() => setEditando(null)}
        onSalvo={async () => {
          setEditando(null);
          await carregarMissoes();
        }}
      />

    </div>

  );

}

function DetalheModal({ item, onClose }) {

  return (

    <Modal
      open={!!item}
      onClose={onClose}
      title={item?.residencia || "Detalhes"}
      subtitle={item?.vistoria}
      size="md"
    >

      {item && (

        <div className="space-y-5">

          <div className="grid grid-cols-2 gap-4 text-sm">

            <div>
              <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Data/Hora Realizada</p>
              <p className="text-[var(--text)] font-medium">{formatDateTime(item.dataHora)}</p>
            </div>

            <div>
              <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Responsável</p>
              <p className="text-[var(--text)] font-medium">{item.responsavel || "-"}</p>
            </div>

            <div>
              <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Residência</p>
              <p className="text-[var(--text)] font-medium">{item.residencia || "-"}</p>
            </div>

            <div>
              <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Ciclo</p>
              <p className="text-[var(--text)] font-medium">{item.ciclo}</p>
            </div>

          </div>

          {item.observacoes && (
            <div>
              <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Observações</p>
              <p className="text-[var(--text-muted)] whitespace-pre-wrap">{item.observacoes}</p>
            </div>
          )}

          {item.fotos?.length > 0 && (
            <div>
              <p className="text-[var(--text-faint)] uppercase text-xs mb-2">Fotos e Vídeos</p>
              <div className="grid grid-cols-3 gap-3">
                {item.fotos.map((midia, index) =>
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
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>

        </div>

      )}

    </Modal>

  );

}

// Corrige a data/hora, o responsável, as observações e as fotos de uma
// missão já registrada -- não mexe em qual residência/ciclo ela é.
function EditarModal({ item, onClose, onSalvo }) {

  const [dataHora, setDataHora] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [fotos, setFotos] = useState([]);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {

    if (!item) return;

    const d = new Date(item.dataHora);
    const pad = (n) => String(n).padStart(2, "0");
    const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setDataHora(local);
    setResponsavel(item.responsavel === "-" ? "" : item.responsavel || "");
    setObservacoes(item.observacoes || "");
    setFotos(item.fotos || []);
    setErro("");

  }, [item]);

  const handleArquivos = async (e) => {

    const arquivos = Array.from(e.target.files || []);
    e.target.value = "";

    let totalAtualMB = tamanhoTotalMB(fotos);

    for (const arquivo of arquivos) {
      try {
        const dataUrl = await lerArquivoComoDataUrl(arquivo, { totalAtualMB });
        totalAtualMB += arquivo.size / 1024 / 1024;
        setFotos((prev) => [...prev, dataUrl]);
      } catch (err) {
        setErro(err.message);
        break;
      }
    }

  };

  const removerFoto = (index) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const salvar = async () => {

    try {

      setSalvando(true);
      setErro("");

      await VistoriaService.atualizarMissao(item.vistoriaId, item.missaoId, {
        dataRealizacao: new Date(dataHora).toISOString(),
        realizadoPor: responsavel || null,
        observacoes: observacoes || null,
        fotos,
      });

      await onSalvo?.();

    } catch (err) {

      setErro(err.message || "Erro ao salvar as alterações.");

    } finally {

      setSalvando(false);

    }

  };

  return (

    <Modal
      open={!!item}
      onClose={onClose}
      title={`Editar -- ${item?.residencia || ""}`}
      subtitle={item?.vistoria}
      size="md"
    >

      {item && (

        <div className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
              Data/Hora Realizada
            </label>
            <input
              type="datetime-local"
              value={dataHora}
              onChange={(e) => setDataHora(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] px-4 py-3 text-[var(--text)] outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">
              Responsável
            </label>
            <input
              type="text"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] px-4 py-3 text-[var(--text)] outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] mb-2">
              <NotebookPen size={16} />
              Observações
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] px-4 py-3 text-[var(--text)] text-sm outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] mb-2">
              <ImageIcon size={16} />
              Fotos e vídeos
            </label>

            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleArquivos}
              className="w-full rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] px-4 py-3 text-[var(--text)] text-sm"
            />

            {fotos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {fotos.map((midia, index) => (
                  <div key={index} className="relative">
                    {midia.startsWith("data:video") ? (
                      <video src={midia} controls className="w-full h-24 object-cover rounded-xl border border-[var(--border-token)]" />
                    ) : (
                      <img src={midia} alt={`Mídia ${index + 1}`} className="w-full h-24 object-cover rounded-xl border border-[var(--border-token)]" />
                    )}
                    <button
                      onClick={() => removerFoto(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
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
            <Button onClick={salvar} disabled={salvando}>
              Salvar
            </Button>
          </div>

        </div>

      )}

    </Modal>

  );

}
