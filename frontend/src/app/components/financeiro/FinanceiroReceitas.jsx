"use client";

import { useState, useEffect } from "react";
import {
  MoreVertical,
  Wallet,
  Plus,
  Pin,
  Repeat,
  FileText,
  ChevronUp,
  ChevronDown,
  Clock,
  TriangleAlert,
} from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";
import ActionMenu from "../ui/ActionMenu";

import ReceitaVisualizarModal from "./ReceitaVisualizarModal";
import ReceitaEditarModal from "./ReceitaEditarModal";
import ReceitaMapaModal from "./ReceitaMapaModal";
import ReceitaBoletoModal from "./ReceitaBoletoModal";
import ReceitaExcluirModal from "./ReceitaExcluirModal";

import { useIsMobile } from "@/hooks/useIsMobile";
import { usePermissao } from "../../../hooks/usePermissao";
import { statusExibidoReceita, badgesEscaladaReceita } from "@/utils/statusReceita";

// Relógio da escalada de corte de água/energia -> desocupação de imóvel
// (ver corteVistoriaService.js no backend) -- 2 janelas em sequência,
// cada uma só existe enquanto a etapa anterior não foi concluída:
//   1) vencimento+72h ÚTEIS -- ainda não tem vistoria de corte
//      (verificarAtrasoCorteJob cria ela quando esse prazo vence).
//   2) corteRealizadoEm+48h ÚTEIS -- corte já realizado, contando pra
//      disparar "FAZER DESOCUPAÇÃO DE IMÓVEL" se a cobrança continuar
//      sem resolver.
// Depois de kitnetEsvaziadaEm (desocupação realizada) não tem mais
// relógio -- vira selo estático (ver badgesEscaladaReceita em
// statusReceita.js), sem prazo, até alguém classificar a inadimplência
// (botão "Inadimplência" nos 3 pontinhos). Pedido do usuário em
// 26/11/2026.
//
// Mesmo padrão visual/de leitura que Vistorias já usa (AtrasoVistoria/
// RelogioAtrasoCorte em VistoriaCard.jsx) -- amarelo pulsante contando
// o tempo que falta, vermelho pulsante contando o tempo que já passou
// (em vez de só um rótulo estático tipo "Risco de corte"), pedido do
// usuário em 25/11/2026 pra padronizar o visual em todo o sistema.
function formatarRestante(ms) {
  const horas = Math.floor(ms / (60 * 60 * 1000));
  const minutos = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${horas}h${String(minutos).padStart(2, "0")}`;
}

function formatarDecorrido(ms) {
  const totalHoras = Math.floor(ms / (60 * 60 * 1000));
  const minutos = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const dias = Math.floor(totalHoras / 24);
  const horas = totalHoras % 24;
  return dias > 0
    ? `${dias} ${dias === 1 ? "dia" : "dias"} e ${horas}h${String(minutos).padStart(2, "0")}`
    : `${horas}h${String(minutos).padStart(2, "0")}`;
}

function RelogioCorte({ receita }) {

  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // Desocupação já realizada (ou inadimplência já classificada) -- não
  // tem mais prazo rolando, vira selo estático fixo (badgesEscaladaReceita).
  if (receita.classificacaoInadimplencia || receita.kitnetEsvaziadaEm) return null;

  const relogio = (desde, rotulo, horasPrazo) => {

    const prazo = new Date(desde).getTime() + horasPrazo * 60 * 60 * 1000;
    const restanteMs = prazo - agora;

    if (restanteMs <= 0) {
      return (
        <span
          className="
            inline-flex items-center gap-1.5
            rounded-xl
            bg-red-600
            px-3 py-1.5
            text-xs font-extrabold text-white
            animate-pulse
            tabular-nums
            shadow-[0_2px_10px_rgba(220,38,38,.5)]
          "
        >
          <TriangleAlert size={14} strokeWidth={2.5} />
          {rotulo} atrasado há {formatarDecorrido(-restanteMs)}
        </span>
      );
    }

    return (
      <span
        className="
          inline-flex items-center gap-1.5
          rounded-xl
          bg-amber-400
          px-3 py-1.5
          text-xs font-extrabold text-slate-900
          tabular-nums
          shadow-[0_2px_8px_rgba(245,158,11,.4)]
        "
      >
        <Clock size={14} strokeWidth={2.5} />
        {rotulo} em {formatarRestante(restanteMs)}
      </span>
    );

  };

  if (receita.corteRealizadoEm) {
    return relogio(receita.corteRealizadoEm, "Desocupação", 48);
  }

  // Sem boleto enviado ao banco, não existe "risco de corte" de
  // verdade -- o inquilino nem recebeu a cobrança pra pagar. Fica só
  // com os badges de Atrasada + Não enviada ao banco (ver mais abaixo
  // no card/linha), sem o relógio nem o alerta de corte.
  const enviada = !!receita.gatewayReferencia && receita.status !== "PAGA" && receita.status !== "PAGO" && receita.status !== "CANCELADA";
  if (!receita.vencimento || !enviada) return null;

  return relogio(receita.vencimento, "Corte", 72);

}

// Cabeçalho clicável pra organizar a lista -- substitui o antigo
// select "Organizar por" (tirava espaço da tela à toa quando dá pra
// clicar direto na coluna, como o resto do sistema já faz). `ordens`
// é [valorAscendente, valorDescendente] dentro de COMPARADORES_FINANCEIRO
// (financeiro/page.js); coluna sem as duas direções (ex.: Kitnet,
// Status) passa só um valor e alterna só liga/desliga.
function CabecalhoOrdenavel({ label, ordens, ordenacao, onOrdenar }) {

  const [asc, desc] = ordens;

  const ativo = ordenacao === asc || ordenacao === desc;

  const alternar = () => {
    if (!desc) {
      onOrdenar?.(asc);
      return;
    }
    onOrdenar?.(ordenacao === asc ? desc : asc);
  };

  return (
    <th
      onClick={alternar}
      className={`text-left pr-4 cursor-pointer select-none hover:text-[var(--text)] transition ${
        ativo ? "text-[var(--text)]" : ""
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {ativo &&
          (desc && ordenacao === desc ? (
            <ChevronDown size={13} />
          ) : (
            <ChevronUp size={13} />
          ))}
      </span>
    </th>
  );
}

function MenuButton({ label, danger, success, warning, purple, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        text-left
        px-4
        py-3
        transition
        ${
          danger
            ? "text-red-400 hover:bg-red-500/10"
            : success
            ? "text-green-400 hover:bg-green-500/10"
            : warning
            ? "text-yellow-400 hover:bg-yellow-500/10"
            : purple
            ? "text-purple-400 hover:bg-purple-500/10"
            : "text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
        }
      `}
    >
      {label}
    </button>
  );
}

// Paga/cancelada sem ter sido enviada a banco nenhum é lançamento
// manual (dinheiro na mão, por exemplo) -- não é pendência, não entra
// na seleção em lote. Mesmo critério do selo "Não enviada ao banco"
// logo abaixo e do filtro "Não enviada" em financeiro/page.js.
function precisaEnviar(item) {
  return (
    !item.gatewayReferencia &&
    item.status !== "PAGA" &&
    item.status !== "PAGO" &&
    item.status !== "CANCELADA"
  );
}

export default function FinanceiroReceitas({
  receitas,
  contas,
  ordenacao,
  onOrdenar,
  onDelete,
  onUpdate,
  onMarcarPago,
  onEnviarCobranca,
  onEnviarSelecionadas,
  enviandoLote = false,
  onFixar,
  onToggleRecorrente,
  onArquivar,
  onNovo,
  titulo = "Receitas",
  subtitulo = "Controle das receitas cadastradas.",
}) {
  const podeEditar = usePermissao("financeiro.editar");
  const podeMarcarPago = usePermissao("financeiro.marcarPago");

  const [receitaSelecionada, setReceitaSelecionada] =
    useState(null);

  // Seleção em lote pra "Enviar Cobrança" -- veio de Transações, pra
  // quem edita (aqui) também poder disparar as pendentes de uma vez,
  // sem precisar ir em outra tela.
  const [selecionadas, setSelecionadas] = useState(new Set());

  function alternarSelecionada(id) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function alternarTodasSelecionadas(ids) {
    setSelecionadas((atual) => {
      const todasJaSelecionadas = ids.every((id) => atual.has(id));
      return todasJaSelecionadas ? new Set() : new Set(ids);
    });
  }

  async function enviarSelecionadasClick() {
    const ids = Array.from(selecionadas);
    await onEnviarSelecionadas?.(ids);
    setSelecionadas(new Set());
  }

  const enviaveis = receitas.filter(precisaEnviar);
  const todasSelecionadas = enviaveis.length > 0 && enviaveis.every((t) => selecionadas.has(t.id));

  const [visualizarOpen, setVisualizarOpen] =
    useState(false);

  const [editarOpen, setEditarOpen] =
    useState(false);

  const [mapaOpen, setMapaOpen] =
    useState(false);

  const [boletoOpen, setBoletoOpen] =
    useState(false);

  const [excluirOpen, setExcluirOpen] =
    useState(false);

  const [menuAberto, setMenuAberto] = useState(null);

  const [posicaoMenu, setPosicaoMenu] = useState({ top: 0, left: 0 });

  const isMobile = useIsMobile();

  function abrirMenu(e, id) {
    const rect = e.currentTarget.getBoundingClientRect();
    const largura = 200;

    let left = rect.right - largura;
    const top = rect.bottom + 8;

    if (left < 16) left = 16;
    if (left + largura > window.innerWidth - 16) {
      left = window.innerWidth - largura - 16;
    }

    setPosicaoMenu({ top, left });
    setMenuAberto(id);
  }

  function renderMenu(item) {
    return (
      <ActionMenu
        open={menuAberto === item.id}
        position={posicaoMenu}
        onClose={() => setMenuAberto(null)}
      >
        <MenuButton
          label="Visualizar"
          onClick={() => {
            setReceitaSelecionada(item);
            setVisualizarOpen(true);
            setMenuAberto(null);
          }}
        />

        {podeEditar && (
          <MenuButton
            label="Editar"
            warning
            onClick={() => {
              setReceitaSelecionada(item);
              setEditarOpen(true);
              setMenuAberto(null);
            }}
          />
        )}

        <MenuButton
          label="Mapa da Cobrança"
          onClick={() => {
            setReceitaSelecionada(item);
            setMapaOpen(true);
            setMenuAberto(null);
          }}
        />

        {podeEditar &&
          item.status !== "PAGO" &&
          item.status !== "PAGA" &&
          (item.gatewayReferencia ? (
            <div className="px-4 py-3 text-xs text-[var(--text-faint)]">
              Já enviada ({item.gatewayProvider || "banco"})
            </div>
          ) : (
            <MenuButton
              label="Enviar Cobrança"
              onClick={() => {
                onEnviarCobranca?.(item.id);
                setMenuAberto(null);
              }}
            />
          ))}

        {podeMarcarPago && (
          <MenuButton
            label="Marcar Pago"
            success
            onClick={() => {
              onMarcarPago?.(item.id);
              setMenuAberto(null);
            }}
          />
        )}

        {(item.status === "PAGO" || item.status === "PAGA") && (
          <MenuButton
            label={item.arquivadaNoHistorico ? "Remover do Histórico" : "Enviar para Histórico"}
            onClick={() => {
              onArquivar?.(item.id, !item.arquivadaNoHistorico);
              setMenuAberto(null);
            }}
          />
        )}

        <MenuButton
          label={item.fixado ? "Desafixar" : "Fixar"}
          onClick={() => {
            onFixar?.(item.id, !item.fixado);
            setMenuAberto(null);
          }}
        />

        {podeEditar && (
          <MenuButton
            label={item.recorrente ? "Desativar Recorrência" : "Ativar Recorrência"}
            onClick={() => {
              onToggleRecorrente?.(item.id, !item.recorrente);
              setMenuAberto(null);
            }}
          />
        )}

        {podeEditar && (
          <MenuButton
            label="Excluir"
            danger
            onClick={() => {
              setReceitaSelecionada(item);
              setExcluirOpen(true);
              setMenuAberto(null);
            }}
          />
        )}
      </ActionMenu>
    );
  }

  const statusExibido = statusExibidoReceita;

  return (
  <>
    <Table>

      <div className="px-6 pt-6">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">

            <div
              className="
                w-12
                h-12

                rounded-2xl

                bg-emerald-500/10

                border
                border-emerald-500/20

                flex
                items-center
                justify-center
              "
            >

              <Wallet className="w-6 h-6 text-emerald-400" />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-[var(--text)]">
                {titulo}
              </h2>

              <p className="text-[var(--text-subtle)]">
                {subtitulo}
              </p>

            </div>

          </div>

          {podeEditar && (
            <button
              onClick={onNovo}
              title="Nova Receita"
              className="
                w-10
                h-10

                rounded-xl

                flex
                items-center
                justify-center

                bg-emerald-500/10
                border
                border-emerald-500/20

                text-emerald-400

                hover:bg-emerald-500/20
                transition
              "
            >
              <Plus size={20} />
            </button>
          )}

        </div>

      </div>

      {podeEditar && onEnviarSelecionadas && enviaveis.length > 0 && (

        <div
          className="
            mx-6
            mt-4

            flex
            flex-wrap
            items-center
            justify-between
            gap-3

            rounded-xl

            border
            border-[var(--border-token)]

            bg-[var(--surface-2)]

            px-4
            py-3
          "
        >

          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <input
              type="checkbox"
              checked={todasSelecionadas}
              onChange={() => alternarTodasSelecionadas(enviaveis.map((t) => t.id))}
            />
            Selecionar todas enviáveis ({enviaveis.length})
          </label>

          {selecionadas.size > 0 && (
            <button
              onClick={enviarSelecionadasClick}
              disabled={enviandoLote}
              className="
                rounded-lg
                bg-sky-600
                hover:bg-sky-700
                disabled:opacity-50
                disabled:cursor-not-allowed
                px-4
                py-2
                text-sm
                font-semibold
                text-[var(--text)]
              "
            >
              {enviandoLote ? "Enviando..." : `Enviar ${selecionadas.size} selecionada(s)`}
            </button>
          )}

        </div>

      )}

      {receitas.length === 0 ? (
        <div className="px-6 pb-6 text-[var(--text-subtle)]">
          Nenhuma receita cadastrada.
        </div>
      ) : isMobile ? (

        <div className="mt-6 px-4 pb-6 space-y-3">

          {receitas.map((item) => {

            const inquilino = item.inquilino || item.contrato?.inquilino;
            const unidade = item.contrato?.unidade || item.inquilino?.kitnet?.unidade;
            const kitnet = item.contrato?.kitnet || item.inquilino?.kitnet;

            return (

              <div
                key={item.id}
                className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-start gap-2.5 min-w-0">

                    {podeEditar && onEnviarSelecionadas && precisaEnviar(item) && (
                      <input
                        type="checkbox"
                        checked={selecionadas.has(item.id)}
                        onChange={() => alternarSelecionada(item.id)}
                        className="mt-1 shrink-0"
                      />
                    )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.fixado && (
                        <Pin size={13} className="text-emerald-400 fill-emerald-400 shrink-0" />
                      )}
                      {item.recorrente && (
                        <Repeat size={13} className="text-sky-400 shrink-0" title="Cobrança recorrente" />
                      )}
                      <p className="font-semibold text-[var(--text)] truncate">
                        {item.descricao}
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-[var(--text-subtle)] truncate">
                      {item.categoria}
                      {inquilino?.nome ? ` · ${inquilino.nome}` : ""}
                    </p>
                  </div>

                  </div>

                  <div className="flex items-center gap-1 shrink-0">

                    {(item.linkBoleto || item.linhaDigitavel || item.pixCopiaECola) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReceitaSelecionada(item);
                          setBoletoOpen(true);
                        }}
                        title="Ver boleto"
                        className="
                          w-9
                          h-9
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          text-emerald-400
                          hover:bg-[var(--surface-3)]
                          transition
                        "
                      >
                        <FileText size={18} />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        menuAberto === item.id
                          ? setMenuAberto(null)
                          : abrirMenu(e, item.id);
                      }}
                      className="
                        w-9
                        h-9
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        hover:bg-[var(--surface-3)]
                        transition
                      "
                    >
                      <MoreVertical size={18} />
                    </button>

                  </div>

                  {renderMenu(item)}

                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-[var(--text-subtle)]">
                  <span className="truncate">
                    {unidade?.nome || "-"}
                    {kitnet?.nome || kitnet?.numero ? ` · ${kitnet?.nome || kitnet?.numero}` : ""}
                  </span>

                  {unidade?.cidade && (
                    <span className="shrink-0 rounded-full bg-[var(--surface-3)] px-2.5 py-0.5 text-xs text-[var(--text-subtle)]">
                      {unidade.cidade}{unidade.uf ? ` - ${unidade.uf}` : ""}
                    </span>
                  )}

                  <span className="ml-auto shrink-0">
                    {item.vencimento
                      ? new Date(item.vencimento).toLocaleDateString("pt-BR")
                      : "-"}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">

                  <span
                    className={`text-xl font-bold ${
                      item.status === "ATRASADA"
                        ? "text-red-400"
                        : item.status === "PAGO" || item.status === "PAGA"
                        ? "text-emerald-400"
                        : "text-yellow-400"
                    }`}
                  >
                    R$ {item.valor}
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">

                    <Badge variant={statusExibido(item).variant}>
                      {statusExibido(item).texto}
                    </Badge>

                    {/* Não existe campo próprio de "quando foi cancelada" --
                        updatedAt serve de proxy (Cancelada é estado final, sem
                        edição depois). Pedido do usuário em 26/11/2026. */}
                    {item.status === "CANCELADA" && item.updatedAt && (
                      <span className="text-xs text-[var(--text-faint)]">
                        em {new Date(item.updatedAt).toLocaleDateString("pt-BR")}
                      </span>
                    )}

                    {/* Selos fixos da escalada (corte/desocupação já
                        realizados) -- empilham em cima de "Atrasada",
                        nunca substituem. Pedido do usuário em 26/11/2026. */}
                    {badgesEscaladaReceita(item).map((badge, indice) => (
                      <Badge key={indice} variant={badge.variant} size="sm">
                        {badge.texto}
                      </Badge>
                    ))}

                    {item.status === "ATRASADA" && (
                      <RelogioCorte receita={item} />
                    )}

                    {item.gatewayProvider ? (
                      <Badge variant="gray" size="sm">
                        {item.gatewayProvider}
                      </Badge>
                    ) : (
                      item.status !== "PAGA" && item.status !== "PAGO" && (
                        <Badge variant="yellow" size="sm">
                          Não enviada ao banco
                        </Badge>
                      )
                    )}

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      ) : (
        <div className="overflow-x-auto mt-6 px-6 pb-6">

          <table className="w-full text-[var(--text-1)]">

            <thead
              className="
                border-b
                border-[var(--border-token)]

                text-[var(--text-subtle)]

                uppercase

                tracking-[0.22em]

                text-xs
              "
            >
              <tr>
                {podeEditar && onEnviarSelecionadas && (
                  <th className="w-10 py-4 pr-2">
                    <input
                      type="checkbox"
                      checked={todasSelecionadas}
                      onChange={() => alternarTodasSelecionadas(enviaveis.map((t) => t.id))}
                      disabled={enviaveis.length === 0}
                    />
                  </th>
                )}

                <th className="text-left py-4 pr-4">
                  Descrição
                </th>

                <th className="text-left pr-4">
                  Categoria
                </th>

                <th className="text-left pr-4">
                  Inquilino
                </th>

                <th className="text-left pr-4">
                  Residencial
                </th>

                <CabecalhoOrdenavel
                  label="Kitnet"
                  ordens={["kitnet"]}
                  ordenacao={ordenacao}
                  onOrdenar={onOrdenar}
                />

                <CabecalhoOrdenavel
                  label="Vencimento"
                  ordens={["vencimento-proximo", "vencimento-distante"]}
                  ordenacao={ordenacao}
                  onOrdenar={onOrdenar}
                />

                <CabecalhoOrdenavel
                  label="Valor"
                  ordens={["valor-menor", "valor-maior"]}
                  ordenacao={ordenacao}
                  onOrdenar={onOrdenar}
                />

                <CabecalhoOrdenavel
                  label="Status"
                  ordens={["status"]}
                  ordenacao={ordenacao}
                  onOrdenar={onOrdenar}
                />

                <CabecalhoOrdenavel
                  label="Enviada em"
                  ordens={["enviada-antiga", "enviada-recente"]}
                  ordenacao={ordenacao}
                  onOrdenar={onOrdenar}
                />

                <th></th>
              </tr>
            </thead>

            <tbody>

              {receitas.map((item) => {

                const inquilino = item.inquilino || item.contrato?.inquilino;
                const unidade = item.contrato?.unidade || item.inquilino?.kitnet?.unidade;
                const kitnet = item.contrato?.kitnet || item.inquilino?.kitnet;

                return (

                <tr
                  key={item.id}
                  className="border-b border-[var(--border-token)] hover:bg-[var(--surface-2)] transition"
                >

                  {podeEditar && onEnviarSelecionadas && (
                    <td className="pr-2">
                      {precisaEnviar(item) && (
                        <input
                          type="checkbox"
                          checked={selecionadas.has(item.id)}
                          onChange={() => alternarSelecionada(item.id)}
                        />
                      )}
                    </td>
                  )}

                  <td className="py-5 pr-4">
                    <div className="flex items-center gap-2">
                      {item.fixado && (
                        <Pin
                          size={14}
                          className="text-emerald-400 fill-emerald-400"
                        />
                      )}
                      {item.recorrente && (
                        <Repeat size={14} className="text-sky-400" title="Cobrança recorrente" />
                      )}
                      {item.descricao}
                    </div>
                  </td>

                  <td className="pr-4">
                    {item.categoria}
                  </td>

                  <td className="text-[var(--text-subtle)] pr-4">
                    {inquilino?.nome || "-"}
                  </td>

                  <td className="text-[var(--text-subtle)] pr-4">
                    {unidade?.nome || "-"}
                  </td>

                  <td className="text-[var(--text-subtle)] pr-4">
                    {kitnet?.nome || kitnet?.numero || "-"}
                  </td>

                  <td className="text-[var(--text-subtle)] pr-4">
                    {item.vencimento
                      ? new Date(item.vencimento).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>

                  <td
                    className={`font-semibold pr-4 ${
                      item.status === "ATRASADA"
                        ? "text-red-400"
                        : item.status === "PAGO" || item.status === "PAGA"
                        ? "text-emerald-400"
                        : "text-yellow-400"
                    }`}
                  >
                    R$ {item.valor}
                  </td>

                  <td className="pr-4">
                    <div className="flex items-center gap-2 flex-wrap">

                      <Badge variant={statusExibido(item).variant}>
                        {statusExibido(item).texto}
                      </Badge>

                      {/* Não existe campo próprio de "quando foi cancelada" --
                          updatedAt serve de proxy (Cancelada é estado final,
                          sem edição depois). Pedido do usuário em 26/11/2026. */}
                      {item.status === "CANCELADA" && item.updatedAt && (
                        <span className="text-xs text-[var(--text-faint)]">
                          em {new Date(item.updatedAt).toLocaleDateString("pt-BR")}
                        </span>
                      )}

                      {/* Selos fixos da escalada (corte/desocupação já
                          realizados) -- empilham em cima de "Atrasada",
                          nunca substituem. Pedido do usuário em 26/11/2026. */}
                      {badgesEscaladaReceita(item).map((badge, indice) => (
                        <Badge key={indice} variant={badge.variant} size="sm">
                          {badge.texto}
                        </Badge>
                      ))}

                      {item.status === "ATRASADA" && (
                        <RelogioCorte receita={item} />
                      )}

                      {item.gatewayProvider ? (
                        <Badge variant="gray" size="sm">
                          {item.gatewayProvider}
                        </Badge>
                      ) : (
                        item.status !== "PAGA" && item.status !== "PAGO" && (
                          <Badge variant="yellow" size="sm">
                            Não enviada ao banco
                          </Badge>
                        )
                      )}

                    </div>
                  </td>

                  <td className="text-[var(--text-subtle)] pr-4 whitespace-nowrap">
                    {item.cobrancaEnviadaEm
                      ? new Date(item.cobrancaEnviadaEm).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>

                  <td>

                    <div className="flex items-center gap-1">

                      {(item.linkBoleto || item.linhaDigitavel || item.pixCopiaECola) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReceitaSelecionada(item);
                            setBoletoOpen(true);
                          }}
                          title="Ver boleto"
                          className="
                            w-9
                            h-9
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            text-emerald-400
                            hover:bg-[var(--surface-3)]
                            transition
                          "
                        >
                          <FileText size={18} />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          menuAberto === item.id
                            ? setMenuAberto(null)
                            : abrirMenu(e, item.id);
                        }}
                        className="
                          w-9
                          h-9
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          hover:bg-[var(--surface-3)]
                          transition
                        "
                      >
                        <MoreVertical size={18} />
                      </button>

                    </div>

                    {renderMenu(item)}

                  </td>

                </tr>

                );

              })}

            </tbody>

          </table>

        </div>
      )}

    </Table>

    <ReceitaVisualizarModal
      isOpen={visualizarOpen}
      onClose={() =>
        setVisualizarOpen(false)
      }
      receita={receitaSelecionada}
    />

    <ReceitaEditarModal
      isOpen={editarOpen}
      onClose={() => {
        setEditarOpen(false);
      }}
      receita={receitaSelecionada}
      onSave={async (dadosAtualizados) => {
        // Precisa esperar (e deixar o erro subir) -- senão o modal
        // fechava sozinho mesmo quando a edição falhava (ex.: senha
        // errada na trava de mudança de valor do boleto).
        await onUpdate?.(
          receitaSelecionada.id,
          dadosAtualizados
        );

        setEditarOpen(false);
      }}
    />

    <ReceitaMapaModal
      isOpen={mapaOpen}
      onClose={() => setMapaOpen(false)}
      receita={receitaSelecionada}
      contaNome={contas?.find((c) => c.id === receitaSelecionada?.contaPagamentoId)?.nome}
    />

    <ReceitaBoletoModal
      isOpen={boletoOpen}
      onClose={() => setBoletoOpen(false)}
      receita={receitaSelecionada}
    />

    <ReceitaExcluirModal
      isOpen={excluirOpen}
      onClose={() => setExcluirOpen(false)}
      receita={receitaSelecionada}
      onConfirmar={onDelete}
    />

  </>
);
}