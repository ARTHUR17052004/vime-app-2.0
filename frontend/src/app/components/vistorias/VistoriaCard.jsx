"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  CheckCircle2,
  XCircle,
  Trash2,
  Pin,
} from "lucide-react";

import Button from "../ui/Button";
import MidiaLightbox from "../ui/MidiaLightbox";
import MidiaRemota from "../ui/MidiaRemota";
import { formatDate, formatDateTime } from "@/utils/formatDate";
import { usePermissao } from "../../../hooks/usePermissao";
import { VistoriaService } from "@/services/vistoria.service";
import AtrasoVistoria from "./AtrasoVistoria";

// Vistoria automática de corte de água/energia por falta de pagamento
// (ver backend/src/jobs/verificarAtrasoCorteJob.js) -- é a única coisa
// que cria vistoria com essa categoria, então basta isso pra marcar o
// card com o visual de alerta (título vermelho, card piscando) sem
// precisar de um campo novo no banco. O relógio (AtrasoVistoria, logo
// abaixo) é o mesmo de qualquer vistoria -- conta o prazo da MISSÃO,
// não o atraso da cobrança por trás (isso é assunto do Financeiro,
// padronizado pelo usuário em 25/11/2026).
//
// Mas o alerta só faz sentido enquanto o corte ainda não foi feito --
// uma vez Realizada (ou Cancelada), o card continuava vermelho/piscando
// pra sempre (reportado em 18/11/2026). Por isso considera "corte" só
// quando a vistoria ainda está aberta.
const STATUS_ENCERRADOS_CORTE = ["REALIZADA", "CANCELADA"];

const ehVistoriaDeCorte = (vistoria) =>
  vistoria.categoria === "Cobrança" &&
  !STATUS_ENCERRADOS_CORTE.includes(vistoria.status);

export default function VistoriaCard({
  vistorias,
  onEdit,
  onDelete,
  onConcluir,
  onCancelar,
  onFixar,
  onVerMissoes,
}) {

  const podeEditar = usePermissao("vistorias.editar");
  const podeExcluir = usePermissao("vistorias.excluir");

  const [aberto, setAberto] =
    useState(null);

  const [lightbox, setLightbox] =
    useState({ vistoriaId: null, indice: null });

  // Fotos/vídeos da baixa não vêm mais na listagem nem no detalhe
  // inteiro (ver vistoriaService.listar/obterMidiaVistoria -- um vídeo
  // de conclusão sozinho passa fácil de 15-25MB em base64, derrubava a
  // conexão de /vistorias e/ou travava no celular sem nem mostrar nada
  // -- bug relatado em 24/11/2026). Busca só a CONTAGEM (uma vez,
  // pra todas as vistorias) e monta os endereços de cada foto/vídeo
  // (ver vistoriaService.midiaUrl) -- cada miniatura (MidiaRemota)
  // busca a dela, sozinha, sob demanda, só quando o card expande.
  const [contagemFotos, setContagemFotos] = useState({});

  useEffect(() => {

    let cancelado = false;

    VistoriaService.contarFotosConclusao()
      .then((linhas) => {
        if (cancelado) return;
        const mapa = {};
        for (const linha of linhas || []) mapa[linha.id] = linha.fotosCount;
        setContagemFotos(mapa);
      })
      .catch(() => {});

    return () => { cancelado = true; };

  }, []);

  const fotosPorVistoria = {};
  if (aberto && contagemFotos[aberto] > 0) {
    fotosPorVistoria[aberto] = Array.from(
      { length: contagemFotos[aberto] },
      (_, indice) => VistoriaService.midiaUrl(aberto, "fotosConclusao", indice)
    );
  }

  if (!vistorias.length) {

    return (

      <div
        className="
          rounded-[22px]
          border
          border-[var(--border-token)]
          bg-[var(--surface)]
          backdrop-blur-xl
          p-10
          text-center
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            text-[var(--text)]
          "
        >
          Nenhuma vistoria cadastrada
        </h2>

      </div>

    );

  }

  const badgeStatus = (status) => {

    switch (status) {

      case "REALIZADA":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";

      case "PENDENTE":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";

      case "CANCELADA":
        return "bg-red-500/20 text-red-400 border border-red-500/30";

      case "ATRASADA":
        return "bg-red-500/20 text-red-400 border border-red-500/30";

      default:
        return "bg-sky-500/20 text-sky-400 border border-sky-500/30";

    }

  };

  return (

    <div className="space-y-6">

      {vistorias.map((vistoria) => {

        const corte = ehVistoriaDeCorte(vistoria);

        return (

        <div
          key={vistoria.id}
          className={`
            rounded-[22px]
            border
            border-[var(--border-token)]
            bg-[var(--surface)]
            backdrop-blur-xl
            overflow-hidden
            transition-all
            duration-300
            hover:border-emerald-500/30
            hover:shadow-[0_0_40px_rgba(16,185,129,.08)]
            ${corte ? "corte-alerta-piscando" : ""}
          `}
        >

          <div
            className="
              p-7
              flex
              items-start
              justify-between
              gap-6
            "
          >

            <div className="flex-1">

              <div className="flex items-center gap-4 flex-wrap">

                <span
                  className={`
                    px-4
                    py-1.5
                    rounded-full
                    text-xs
                    font-semibold
                    ${badgeStatus(vistoria.status)}
                  `}
                >
                  {vistoria.status}
                </span>

                {/* Mesmo relógio de qualquer vistoria (prazo da MISSÃO --
                    dataProxima), mesmo sendo de corte -- o atraso da
                    COBRANÇA por trás é assunto do Financeiro agora, não
                    de Vistorias (padronizado pelo usuário em 25/11/2026:
                    aqui vermelho = prazo do zelador estourado, nunca o
                    atraso da dívida). */}
                <AtrasoVistoria vistoria={vistoria} />

                <h2
                  className={`
                    text-2xl
                    font-bold
                    ${corte ? "text-red-400" : "text-[var(--text)]"}
                  `}
                >
                  {corte ? "⚠️ " : ""}{vistoria.nomeVistoria}
                </h2>

                {vistoria.fixado && (
                  <Pin
                    size={18}
                    className="text-emerald-400 fill-emerald-400"
                  />
                )}

                {vistoria.progressoMissoes && (
                  <button
                    onClick={() => onVerMissoes?.(vistoria.id)}
                    title="Ver histórico de residências vistoriadas"
                    className="
                      text-xs
                      font-semibold
                      text-emerald-400
                      bg-emerald-500/10
                      border
                      border-emerald-500/30
                      rounded-full
                      px-3
                      py-1
                      hover:bg-emerald-500/20
                      transition
                    "
                  >
                    {vistoria.progressoMissoes.concluidas}/{vistoria.progressoMissoes.total} VIMEs já vistoriadas
                  </button>
                )}

              </div>

              {vistoria.descricao && (
                <p
                  className={`
                    mt-2
                    text-sm
                    font-semibold
                    ${corte ? "text-red-300" : "text-[var(--text-muted)]"}
                  `}
                >
                  {vistoria.descricao}
                </p>
              )}

              <div className="mt-5 grid md:grid-cols-2 gap-4">

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Residência / Kitnet
                  </p>

                  <p className="text-[var(--text-muted)] mt-1">

                    {vistoria.unidadeNome}

                    {" • "}

                    {vistoria.kitnetNome}

                  </p>

                </div>

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Responsável
                  </p>

                  <p className="text-[var(--text-muted)] mt-1">
                    {vistoria.responsavel}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Periodicidade
                  </p>

                  <p className="text-[var(--text-muted)] mt-1">
                    {vistoria.periodicidade}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Próxima Execução
                  </p>

                  <p className="text-[var(--text-muted)] mt-1">
                    {formatDate(vistoria.dataProxima)}
                  </p>

                </div>

              </div>

            </div>

            <div className="flex items-center gap-2">

              <button
                onClick={() =>
                  onFixar?.(vistoria.id, !vistoria.fixado)
                }
                title={vistoria.fixado ? "Desafixar" : "Fixar"}
                className={`
                  w-10
                  h-10
                  rounded-xl
                  hover:bg-[var(--surface-2)]
                  transition
                  flex
                  items-center
                  justify-center
                  ${vistoria.fixado ? "text-emerald-400" : "text-[var(--text-subtle)]"}
                `}
              >

                <Pin
                  size={18}
                  className={vistoria.fixado ? "fill-emerald-400" : ""}
                />

              </button>

              <button
                onClick={() =>
                  setAberto(
                    aberto === vistoria.id
                      ? null
                      : vistoria.id
                  )
                }
                className="
                  w-10
                  h-10
                  rounded-xl
                  hover:bg-[var(--surface-2)]
                  transition
                  flex
                  items-center
                  justify-center
                "
              >

                {aberto === vistoria.id ? (

                  <ChevronUp
                    size={20}
                    className="text-[var(--text-subtle)]"
                  />

                ) : (

                  <ChevronDown
                    size={20}
                    className="text-[var(--text-subtle)]"
                  />

                )}

              </button>

            </div>

          </div>

          <div
            className="
              flex
              flex-wrap
              gap-3
              px-7
              pb-6
            "
          >

            <Link
              href={`/vistorias/${vistoria.id}`}
              className="
                flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                border
                border-[var(--border-token)]
                text-[var(--text-muted)]
                text-sm
                font-semibold
                hover:bg-[var(--surface-2)]
                transition
              "
            >
              <Eye size={16} />
              Visualizar
            </Link>

            {podeEditar && (
              <button
                onClick={() => onEdit?.(vistoria)}
                className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-yellow-500/20
                  bg-yellow-500/10
                  text-yellow-400
                  text-sm
                  font-semibold
                  hover:bg-yellow-500/20
                  transition
                "
              >
                <Pencil size={16} />
                Editar
              </button>
            )}

            {podeEditar && (
              <button
                onClick={() => onConcluir?.(vistoria.id)}
                className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-emerald-500/20
                  bg-emerald-500/10
                  text-emerald-400
                  text-sm
                  font-semibold
                  hover:bg-emerald-500/20
                  transition
                "
              >
                <CheckCircle2 size={16} />
                Realizar
              </button>
            )}

            {podeEditar && (
              <button
                onClick={() => onCancelar?.(vistoria.id)}
                className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-orange-500/20
                  bg-orange-500/10
                  text-orange-400
                  text-sm
                  font-semibold
                  hover:bg-orange-500/20
                  transition
                "
              >
                <XCircle size={16} />
                Cancelar
              </button>
            )}

            {podeExcluir && (
              <button
                onClick={() => onDelete?.(vistoria.id)}
                className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-red-500/20
                  bg-red-500/10
                  text-red-400
                  text-sm
                  font-semibold
                  hover:bg-red-500/20
                  transition
                "
              >
                <Trash2 size={16} />
                Excluir
              </button>
            )}

          </div>

          {aberto === vistoria.id && (

            <div
              className="
                border-t
                border-[var(--border-token)]
                bg-[var(--surface-2)]
                p-7
              "
            >

              <div className="grid md:grid-cols-2 gap-6">

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Categoria
                  </p>

                  <p className="text-[var(--text)] mt-1">
                    {vistoria.categoria}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Última Execução
                  </p>

                  <p className="text-[var(--text)] mt-1">
                    {formatDate(vistoria.dataUltima)}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Próxima Execução
                  </p>

                  <p className="text-[var(--text)] mt-1">
                    {formatDate(vistoria.dataProxima)}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Baixa Registrada Em
                  </p>

                  <p className="text-[var(--text)] mt-1">
                    {formatDateTime(vistoria.concluidaEm)}
                  </p>

                </div>

              </div>

              <div className="mt-8">

                <p className="text-xs text-[var(--text-faint)] uppercase">
                  Observações
                </p>

                <div
                  className="
                    mt-3
                    rounded-2xl
                    border
                    border-[var(--border-token)]
                    bg-[var(--surface-2)]
                    p-5
                    text-[var(--text-muted)]
                    leading-7
                  "
                >
                  {vistoria.observacoes ||
                    "Nenhuma observação cadastrada."}
                </div>

              </div>

              {(fotosPorVistoria[vistoria.id]?.length > 0) && (

                <div className="mt-8">

                  <p className="text-xs text-[var(--text-faint)] uppercase mb-3">
                    Fotos e Vídeos da Baixa
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">

                    {fotosPorVistoria[vistoria.id].map((url, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setLightbox({ vistoriaId: vistoria.id, indice: index })}
                        className="relative group"
                      >
                        <MidiaRemota
                          src={url}
                          className="w-full h-40 object-cover rounded-2xl border border-[var(--border-token)]"
                        />
                        <span className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/20 transition" />
                      </button>
                    ))}

                  </div>

                  <MidiaLightbox
                    itens={fotosPorVistoria[vistoria.id]}
                    indice={lightbox.vistoriaId === vistoria.id ? lightbox.indice : null}
                    onClose={() => setLightbox({ vistoriaId: null, indice: null })}
                    onMudarIndice={(i) => setLightbox({ vistoriaId: vistoria.id, indice: i })}
                  />

                </div>

              )}

              <div className="flex justify-end mt-8">

                <Button
                  onClick={() =>
                    setAberto(null)
                  }
                  variant="secondary"
                >
                  Fechar
                </Button>

              </div>

            </div>

          )}

        </div>

        );

      })}

    </div>

  );

}