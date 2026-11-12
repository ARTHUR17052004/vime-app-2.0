"use client";

import { ChevronUp, ChevronDown } from "lucide-react";

export default function Table({
  children,

  columns = [],
  data = [],

  loading = false,

  emptyMessage = "Nenhum registro encontrado.",

  onRowClick,

  striped = false,
  hover = true,
  stickyHeader = true,
  compact = false,

  maxHeight = "650px",

  footer,

  rowClassName = "",
  cellClassName = "",

  // Clique no cabeçalho ordena -- só no MODO 2 (columns+data), e só pra
  // coluna que declarar `sortKey` (liga/desliga, uma direção só) ou
  // `sortKeys: [asc, desc]` (alterna nos dois sentidos) -- mesmo padrão
  // de CabecalhoOrdenavel usado nas tabelas feitas à mão (Financeiro,
  // Contratos...). Sem isso numa coluna, o `<th>` continua estático,
  // igual sempre foi.
  ordenacao,
  onOrdenar,
}) {

  if (loading) {

    return (

      <div
        className="
          rounded-[22px]
          border
          border-[var(--border-token)]

          bg-[var(--surface)]

          backdrop-blur-xl

          p-14

          text-center
        "
      >

        <p className="text-[var(--text-subtle)]">

          Carregando...

        </p>

      </div>

    );

  }

  // MODO 1 -> TABLE CUSTOMIZADA (children)
  if (children) {

    return (

      <div
        className="
          overflow-hidden

          rounded-[22px]

          border
          border-[var(--border-token)]

          bg-[var(--surface)]

          backdrop-blur-xl

          shadow-[0_8px_20px_rgba(0,0,0,.18)]
        "
      >

        <div
          className="
            overflow-x-auto
            overflow-y-visible
          "
          style={{
            maxHeight,
          }}
        >

          {children}

        </div>

        {footer && (

          <div
            className="
              border-t
              border-[var(--border-token)]

              px-6
              py-4
            "
          >

            {footer}

          </div>

        )}

      </div>

    );

  }

  // MODO 2 -> TABLE AUTOMÁTICA
  return (

    <div
      className="
        overflow-hidden

        rounded-[22px]

        border
        border-[var(--border-token)]

        bg-[var(--surface)]

        backdrop-blur-xl

        shadow-[0_8px_20px_rgba(0,0,0,.18)]
      "
    >

      <div
        className="
          overflow-x-auto
          overflow-y-visible
        "
        style={{
          maxHeight,
        }}
      >

        <table className="min-w-full">

          <thead
            className={`
              ${
                stickyHeader
                  ? "sticky top-0 z-10"
                  : ""
              }

              bg-[#182128]/95
              backdrop-blur-xl
            `}
          >

            <tr>

              {columns.map((column) => {

                const ordens = column.sortKeys || (column.sortKey ? [column.sortKey] : null);

                if (!ordens) {

                  return (

                    <th
                      key={column.key}
                      className={`
                        text-left

                        uppercase

                        tracking-[0.22em]

                        font-semibold

                        text-[var(--text-subtle)]

                        border-b
                        border-[var(--border-token)]

                        ${
                          compact
                            ? "px-4 py-3 text-[11px]"
                            : "px-6 py-5 text-[12px]"
                        }
                      `}
                    >

                      {column.title}

                    </th>

                  );

                }

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
                    key={column.key}
                    onClick={alternar}
                    className={`
                      text-left

                      uppercase

                      tracking-[0.22em]

                      font-semibold

                      cursor-pointer
                      select-none
                      transition

                      border-b
                      border-[var(--border-token)]

                      ${ativo ? "text-[var(--text)]" : "text-[var(--text-subtle)] hover:text-[var(--text)]"}

                      ${
                        compact
                          ? "px-4 py-3 text-[11px]"
                          : "px-6 py-5 text-[12px]"
                      }
                    `}
                  >

                    <span className="inline-flex items-center gap-1">
                      {column.title}
                      {ativo &&
                        (desc && ordenacao === desc ? (
                          <ChevronDown size={13} />
                        ) : (
                          <ChevronUp size={13} />
                        ))}
                    </span>

                  </th>

                );

              })}

            </tr>

          </thead>

          <tbody>

            {data.length === 0 ? (

              <tr>

                <td
                  colSpan={columns.length}
                  className="
                    py-20

                    text-center

                    text-[var(--text-faint)]
                  "
                >

                  {emptyMessage}

                </td>

              </tr>

            ) : (

              data.map((item, index) => (

                <tr
                  key={item.id || index}

                  onClick={() => onRowClick?.(item)}

                  className={`
                    transition-all

                    duration-300

                    border-b

                    border-[var(--border-token)]

                    ${
                      onRowClick
                        ? "cursor-pointer"
                        : ""
                    }

                    ${
                      striped &&
                      index % 2 === 1
                        ? "bg-[var(--surface-2)]"
                        : ""
                    }

                    ${
                      hover
                        ? "hover:bg-emerald-500/5"
                        : ""
                    }

                    ${rowClassName}
                  `}
                >

                  {columns.map((column) => (

                    <td
                      key={column.key}
                      className={`
                        whitespace-nowrap

                        text-[var(--text-1)]

                        ${
                          compact
                            ? "px-4 py-3 text-[13px]"
                            : "px-6 py-5 text-[14px]"
                        }

                        ${cellClassName}
                      `}
                    >

                      {column.render
                        ? column.render(item)
                        : item[column.key]}

                    </td>

                  ))}

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {footer && (

        <div
          className="
            border-t
            border-[var(--border-token)]

            px-6
            py-4
          "
        >

          {footer}

        </div>

      )}

    </div>

  );

}