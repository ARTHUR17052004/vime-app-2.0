"use client";

export default function Table({
  columns = [],
  data = [],

  loading = false,

  emptyMessage = "Nenhum registro encontrado.",

  onRowClick,

  striped = false,
}) {

  if (loading) {

    return (

      <div
        className="
          rounded-[22px]

          border
          border-white/5

          bg-gradient-to-br
          from-[#1b2728]/80
          via-[#1a242c]/75
          to-[#151d26]/80

          backdrop-blur-xl

          p-14

          text-center
        "
      >

        <p className="text-gray-400">

          Carregando...

        </p>

      </div>

    );

  }

  return (

    <div

      className="

        overflow-hidden

        rounded-[22px]

        border
        border-white/5

        bg-gradient-to-br
        from-[#1b2728]/80
        via-[#1a242c]/75
        to-[#151d26]/80

        backdrop-blur-xl

        shadow-[0_8px_20px_rgba(0,0,0,.18)]

      "

    >

      <div className="overflow-auto max-h-[650px]">

        <table className="min-w-full">

          <thead
            className="
              sticky
              top-0
              z-10

              bg-[#182128]/95
              backdrop-blur-xl
            "
          >

            <tr>

              {columns.map((column) => (

                <th

                  key={column.key}

                  className="

                    px-6
                    py-5

                    text-left

                    text-[12px]

                    uppercase

                    tracking-[0.22em]

                    font-semibold

                    text-gray-400

                    border-b
                    border-white/5

                  "

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

                    text-gray-500

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
                    border-white/[0.03]

                    ${onRowClick ? "cursor-pointer" : ""}

                    ${striped && index % 2 === 1
                      ? "bg-white/[0.015]"
                      : ""
                    }

                    hover:bg-emerald-500/5

                  `}

                >

                  {columns.map((column) => (

                    <td

                      key={column.key}

                      className="

                        px-6
                        py-5

                        text-[14px]

                        text-gray-200

                        whitespace-nowrap

                      "

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

    </div>

  );

}