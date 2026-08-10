"use client";

import {
  FileText,
  Upload,
  Search,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";

const documentos = [
  {
    nome: "Contrato de Locação - João.pdf",
    status: "Aguardando Assinatura",
    assinantes: "1/2",
    data: "10/08/2026",
  },
  {
    nome: "Aditivo Contratual.pdf",
    status: "Concluído",
    assinantes: "2/2",
    data: "09/08/2026",
  },
];

export default function DocumentosCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      {/* Cabeçalho */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">

        <div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">

            <FileText className="text-emerald-400" size={26} />

            Documentos

          </h2>

          <p className="text-slate-400">

            Gerencie todos os documentos enviados para assinatura.

          </p>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white transition hover:bg-emerald-700">

          <Plus size={18} />

          Novo Documento

        </button>

      </div>

      {/* Pesquisa */}

      <div className="relative mb-6">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          placeholder="Pesquisar documento..."
          className="w-full rounded-2xl border border-white/10 bg-slate-800/40 py-3 pl-11 pr-4 text-white outline-none transition focus:border-emerald-500"
        />

      </div>

      {/* Upload */}

      <div className="mb-8 rounded-3xl border-2 border-dashed border-white/10 bg-slate-800/30 p-10 text-center transition hover:border-emerald-500/40">

        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">

          <Upload
            size={36}
            className="text-emerald-400"
          />

        </div>

        <h3 className="text-xl font-semibold text-white">

          Adicionar documentos

        </h3>

        <p className="mt-2 text-slate-400">

          Clique aqui ou arraste arquivos PDF para envio.

        </p>

        <button className="mt-6 rounded-2xl bg-emerald-600 px-6 py-3 text-white transition hover:bg-emerald-700">

          Selecionar Arquivos

        </button>

      </div>

      {/* Lista */}

      <div className="space-y-4">

        {documentos.map((doc, index) => (

          <div
            key={index}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-800/40 p-5 lg:flex-row lg:items-center lg:justify-between"
          >

            <div>

              <h3 className="font-semibold text-white">

                {doc.nome}

              </h3>

              <p className="text-sm text-slate-400">

                {doc.status}

              </p>

            </div>

            <div className="flex items-center gap-8">

              <div>

                <p className="text-xs text-slate-500">

                  Assinantes

                </p>

                <p className="text-white">

                  {doc.assinantes}

                </p>

              </div>

              <div>

                <p className="text-xs text-slate-500">

                  Data

                </p>

                <p className="text-white">

                  {doc.data}

                </p>

              </div>

              <div className="flex gap-2">

                <button className="rounded-xl bg-slate-700 p-2 text-white hover:bg-slate-600">

                  <Eye size={18} />

                </button>

                <button className="rounded-xl bg-red-600 p-2 text-white hover:bg-red-700">

                  <Trash2 size={18} />

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}