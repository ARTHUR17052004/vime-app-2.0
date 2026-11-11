"use client";

import { useState, useEffect } from "react";
import {
  MoreVertical,
  Wallet,
  Plus,
  Pin,
  Repeat,
  FileText,
} from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";
import ActionMenu from "../ui/ActionMenu";

import ReceitaVisualizarModal from "./ReceitaVisualizarModal";
import ReceitaEditarModal from "./ReceitaEditarModal";
import ReceitaMapaModal from "./ReceitaMapaModal";
import ReceitaBoletoModal from "./ReceitaBoletoModal";

import { useIsMobile } from "@/hooks/useIsMobile";
import { usePermissao } from "../../../hooks/usePermissao";
import { statusExibidoReceita } from "@/utils/statusReceita";

// Relógio de 72h -- o contrato prevê corte de água/energia depois de
// 72h de atraso (ver verificarAtrasoCorteJob.js, que cria uma Vistoria
// interna sozinho quando esse prazo vence). Conta direto a partir do
// vencimento, sem precisar guardar "quando entrou em atraso" em lugar
// nenhum -- é sempre vencimento + 72h.
function RelogioCorte({ vencimento, enviada }) {

  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // Sem boleto enviado ao banco, não existe "risco de corte" de
  // verdade -- o inquilino nem recebeu a cobrança pra pagar. Fica só
  // com os badges de Atrasada + Não enviada ao banco (ver mais abaixo
  // no card/linha), sem o relógio nem o alerta de corte.
  if (!vencimento || !enviada) return null;

  const prazo = new Date(vencimento).getTime() + 72 * 60 * 60 * 1000;
  const restanteMs = prazo - agora;

  if (restanteMs <= 0) {
    return (
      <Badge variant="red" size="sm">
        Risco de corte
      </Badge>
    );
  }

  const horas = Math.floor(restanteMs / (60 * 60 * 1000));
  const minutos = Math.floor((restanteMs % (60 * 60 * 1000)) / (60 * 1000));

  return (
    <Badge variant="yellow" size="sm">
      Corte em {horas}h{String(minutos).padStart(2, "0")}
    </Badge>
  );

}

function MenuButton({ label, danger, success, warning, onClick }) {
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
            : "text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
        }
      `}
    >
      {label}
    </button>
  );
}

export default function FinanceiroReceitas({
  receitas,
  contas,
  onDelete,
  onUpdate,
  onMarcarPago,
  onEnviarCobranca,
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

  const [visualizarOpen, setVisualizarOpen] =
    useState(false);

  const [editarOpen, setEditarOpen] =
    useState(false);

  const [mapaOpen, setMapaOpen] =
    useState(false);

  const [boletoOpen, setBoletoOpen] =
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
              onDelete?.(item.id);
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

                <div className="mt-3 flex items-center justify-between text-sm text-[var(--text-subtle)]">
                  <span className="truncate">
                    {unidade?.nome || "-"}
                    {kitnet?.nome || kitnet?.numero ? ` · ${kitnet?.nome || kitnet?.numero}` : ""}
                  </span>

                  <span className="shrink-0">
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

                  <div className="flex items-center gap-2">

                    <Badge variant={statusExibido(item).variant}>
                      {statusExibido(item).texto}
                    </Badge>

                    {item.status === "ATRASADA" && (
                      <RelogioCorte vencimento={item.vencimento} enviada={!!item.gatewayReferencia} />
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

                <th className="text-left pr-4">
                  Kitnet
                </th>

                <th className="text-left pr-4">
                  Vencimento
                </th>

                <th className="text-left pr-4">
                  Valor
                </th>

                <th className="text-left pr-4">
                  Status
                </th>

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

                      {item.status === "ATRASADA" && (
                        <RelogioCorte vencimento={item.vencimento} enviada={!!item.gatewayReferencia} />
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
      onSave={(dadosAtualizados) => {
        onUpdate?.(
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

  </>
);
}