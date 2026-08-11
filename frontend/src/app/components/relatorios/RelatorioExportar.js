"use client";

export default function RelatorioExportar() {

  function exportarPDF() {

    alert(
      "Exportação PDF será implementada na V2."
    );

  }

  function exportarExcel() {

    alert(
      "Exportação Excel será implementada na V2."
    );

  }

  function imprimir() {

    window.print();

  }

  return (

    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

      <h2 className="text-2xl font-bold text-white mb-6">

        Exportações

      </h2>

      <div className="grid md:grid-cols-3 gap-6">

        <button
          onClick={exportarPDF}
          className="
            bg-green-700
            hover:bg-green-800
            text-white
            rounded-2xl
            p-5
            transition
          "
        >

          Exportar PDF

        </button>

        <button
          onClick={exportarExcel}
          className="
            bg-green-700
            hover:bg-green-800
            text-white
            rounded-2xl
            p-5
            transition
          "
        >

          Exportar Excel

        </button>

        <button
          onClick={imprimir}
          className="
            bg-gray-800
            hover:bg-black
            text-white
            rounded-2xl
            p-5
            transition
          "
        >

          Imprimir

        </button>

      </div>

    </div>

  );

}