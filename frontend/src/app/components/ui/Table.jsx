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
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-gray-500">
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div className="overflow-auto max-h-[650px]">

        <table className="min-w-full">

          <thead className="bg-gray-50 sticky top-0 z-10">

            <tr>

              {columns.map((column) => (

                <th
                  key={column.key}
                  className="
                    px-6
                    py-4
                    text-left
                    text-sm
                    font-semibold
                    text-gray-700
                    uppercase
                    tracking-wider
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
                    py-16
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
                    transition-colors

                    ${onRowClick ? "cursor-pointer" : ""}

                    ${
                      striped && index % 2 === 1
                        ? "bg-gray-50"
                        : ""
                    }

                    hover:bg-green-50
                  `}
                >

                  {columns.map((column) => (

                    <td
                      key={column.key}
                      className="
                        px-6
                        py-4
                        text-sm
                        text-gray-700
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