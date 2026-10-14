"use client";

import { useEffect, useState } from "react";
import { FileDown, FileSpreadsheet } from "lucide-react";

import { RelatorioService } from "@/services/relatorio.service";
import { relatorioPorChave } from "@/config/catalogoRelatorios";
import { exportarPDF, exportarExcel } from "@/utils/exportar";

const slug = (texto) =>
  texto
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function RelatorioCards({ podeExportar = true }) {

  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {

    async function carregar() {
      try {
        const resposta = await RelatorioService.listarConfig();
        setTipos((resposta.data || []).filter((t) => t.ativo));
      } catch (err) {
        setErro(err.message || "Erro ao carregar os relatórios disponíveis.");
      } finally {
        setLoading(false);
      }
    }

    carregar();

  }, []);

  async function exportar(tipo, formato) {

    const relatorio = relatorioPorChave(tipo.chave);
    if (!relatorio) return;

    setGerando(`${tipo.chave}-${formato}`);
    setErro("");

    try {

      const { colunas, linhas } = await relatorio.gerar();
      const nomeArquivo = slug(relatorio.titulo);

      if (linhas.length === 0) {
        setErro(`"${relatorio.titulo}" não tem nenhum registro pra exportar agora.`);
        return;
      }

      if (formato === "pdf") {
        exportarPDF({
          titulo: relatorio.titulo,
          secoes: [{ colunas, linhas }],
          nomeArquivo,
        });
      } else {
        exportarExcel({
          abas: [{ nome: relatorio.titulo, colunas, linhas }],
          nomeArquivo,
        });
      }

    } catch (err) {

      setErro(err.message || `Erro ao gerar "${relatorio.titulo}".`);

    } finally {

      setGerando(null);

    }

  }

  const grupos = tipos.reduce((mapa, t) => {
    (mapa[t.grupo] = mapa[t.grupo] || []).push(t);
    return mapa;
  }, {});

  return (

    <div className="mb-8">

      <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
        Relatórios Disponíveis
      </h2>

      {erro && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
          {erro}
        </div>
      )}

      {loading && (
        <p className="text-center text-[var(--text-subtle)] py-10">
          Carregando...
        </p>
      )}

      {!loading && tipos.length === 0 && (
        <p className="text-center text-[var(--text-subtle)] py-10">
          Nenhum relatório disponível no momento.
        </p>
      )}

      {!loading && Object.entries(grupos).map(([grupo, lista]) => (

        <div key={grupo} className="mb-8">

          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-subtle)] mb-4">
            {grupo}
          </p>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

            {lista.map((item) => (

              <div
                key={item.chave}
                className="
                  bg-[var(--surface)]
                  backdrop-blur-xl
                  border
                  border-[var(--border-token)]
                  rounded-3xl
                  p-6
                  flex
                  flex-col
                "
              >

                <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                  {item.rotulo}
                </h3>

                <p className="text-sm text-[var(--text-subtle)] mb-6 flex-1">
                  {item.descricao}
                </p>

                {podeExportar ? (

                  <div className="grid grid-cols-2 gap-3">

                    <button
                      onClick={() => exportar(item, "pdf")}
                      disabled={gerando === `${item.chave}-pdf`}
                      className="
                        flex items-center justify-center gap-2
                        bg-green-700 hover:bg-green-800 disabled:opacity-50
                        text-[var(--text)] py-3 rounded-2xl transition text-sm font-medium
                      "
                    >
                      <FileDown size={15} />
                      {gerando === `${item.chave}-pdf` ? "Gerando..." : "PDF"}
                    </button>

                    <button
                      onClick={() => exportar(item, "excel")}
                      disabled={gerando === `${item.chave}-excel`}
                      className="
                        flex items-center justify-center gap-2
                        bg-[var(--surface-2)] hover:bg-[var(--surface-3)] disabled:opacity-50
                        border border-[var(--border-token)]
                        text-[var(--text)] py-3 rounded-2xl transition text-sm font-medium
                      "
                    >
                      <FileSpreadsheet size={15} />
                      {gerando === `${item.chave}-excel` ? "Gerando..." : "Excel"}
                    </button>

                  </div>

                ) : (

                  <p className="text-xs text-[var(--text-faint)]">
                    Sem permissão para exportar.
                  </p>

                )}

              </div>

            ))}

          </div>

        </div>

      ))}

    </div>

  );

}
