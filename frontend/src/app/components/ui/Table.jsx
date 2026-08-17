"use client";

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

              {columns.map((column) => (

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

              ))}

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