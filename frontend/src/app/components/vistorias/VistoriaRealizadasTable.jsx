"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Image as ImageIcon } from "lucide-react";

import Table from "../ui/Table";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { VistoriaService } from "@/services/vistoria.service";
import { formatDateTime } from "@/utils/formatDate";

// Junta as duas fontes de "realizada" que existem no sistema: cada
// missão de uma vistoria "Geral" (uma por residência/ciclo, histórico
// completo) e a última execução registrada de uma vistoria normal
// (concluidaEm -- só a mais recente, essa não guarda toda vez que já
// foi concluída antes).
export default function VistoriaRealizadasTable({
  vistorias = [],
  filtroVistoriaId = null,
  onLimparFiltro,
}) {

  const [missoesRealizadas, setMissoesRealizadas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [detalhe, setDetalhe] = useState(null);

  useEffect(() => {

    async function carregar() {

      try {
        const resposta = await VistoriaService.listarArquivoMissoes();
        setMissoesRealizadas(Array.isArray(resposta) ? resposta : []);
      } catch (err) {
        console.error("Erro ao carregar vistorias realizadas:", err);
      } finally {
        setCarregando(false);
      }

    }

    carregar();

  }, []);

  const linhas = useMemo(() => {

    const deMissoes = missoesRealizadas.map((m) => ({
      vistoriaId: m.vistoriaId,
      vistoria: m.vistoria?.titulo || "-",
      residencia: m.unidade?.nome || "-",
      ciclo: m.ciclo,
      dataHora: m.dataRealizacao,
      responsavel: m.realizadoPor || "-",
      fotos: m.fotos || null,
      observacoes: m.observacoes || null,
    }));

    const deRegulares = vistorias
      .filter((v) => v.unidadeId && v.concluidaEm)
      .map((v) => ({
        vistoriaId: v.id,
        vistoria: v.nomeVistoria,
        residencia: v.unidadeNome,
        ciclo: "-",
        dataHora: v.concluidaEm,
        responsavel: v.responsavel || "-",
        fotos: v.fotosConclusao || null,
        observacoes: v.observacoesConclusao || null,
      }));

    return [...deMissoes, ...deRegulares]
      .filter((item) => !filtroVistoriaId || item.vistoriaId === filtroVistoriaId)
      .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

  }, [missoesRealizadas, vistorias, filtroVistoriaId]);

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
        <button
          onClick={() => setDetalhe(item)}
          className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
        >
          <Eye size={15} />
          Ver
        </button>
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

      <Modal
        open={!!detalhe}
        onClose={() => setDetalhe(null)}
        title={detalhe?.residencia || "Detalhes"}
        subtitle={detalhe?.vistoria}
        size="md"
      >

        {detalhe && (

          <div className="space-y-5">

            <div className="grid grid-cols-2 gap-4 text-sm">

              <div>
                <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Data/Hora Realizada</p>
                <p className="text-[var(--text)] font-medium">{formatDateTime(detalhe.dataHora)}</p>
              </div>

              <div>
                <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Responsável</p>
                <p className="text-[var(--text)] font-medium">{detalhe.responsavel || "-"}</p>
              </div>

              <div>
                <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Residência</p>
                <p className="text-[var(--text)] font-medium">{detalhe.residencia || "-"}</p>
              </div>

              <div>
                <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Ciclo</p>
                <p className="text-[var(--text)] font-medium">{detalhe.ciclo}</p>
              </div>

            </div>

            {detalhe.observacoes && (
              <div>
                <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Observações</p>
                <p className="text-[var(--text-muted)] whitespace-pre-wrap">{detalhe.observacoes}</p>
              </div>
            )}

            {detalhe.fotos?.length > 0 && (
              <div>
                <p className="text-[var(--text-faint)] uppercase text-xs mb-2">Fotos e Vídeos</p>
                <div className="grid grid-cols-3 gap-3">
                  {detalhe.fotos.map((midia, index) =>
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
              <Button variant="secondary" onClick={() => setDetalhe(null)}>
                Fechar
              </Button>
            </div>

          </div>

        )}

      </Modal>

    </div>

  );

}
