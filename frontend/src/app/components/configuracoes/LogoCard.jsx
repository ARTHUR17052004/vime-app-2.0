"use client";

import { useRef } from "react";
import { Image, UploadCloud } from "lucide-react";

export default function LogoCard({
  dados = {},
  onChange = () => {},
  onSalvar = () => {},
  salvando = false,
}) {

  const inputRef = useRef(null);

  function selecionarArquivo(e) {

    const arquivo = e.target.files?.[0];

    if (!arquivo) return;

    const leitor = new FileReader();

    leitor.onload = () => {
      onChange("logo", leitor.result);
    };

    leitor.readAsDataURL(arquivo);

  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
          <Image size={24} className="text-emerald-400" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Logo do Sistema
          </h2>

          <p className="text-sm text-gray-400">
            Defina a identidade visual da empresa.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="
            rounded-2xl border border-dashed border-white/10
            bg-slate-800/50 h-48
            flex flex-col items-center justify-center
            text-gray-400
            hover:border-emerald-500/40 hover:text-emerald-400
            transition-all
            overflow-hidden
          "
        >

          {dados.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dados.logo}
              alt="Logo do sistema"
              className="max-h-full max-w-full object-contain p-4"
            />
          ) : (
            <>
              <UploadCloud size={42} />
              <p className="mt-4 text-sm">
                Clique para enviar uma logo
              </p>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={selecionarArquivo}
            className="hidden"
          />

        </button>

        <div className="space-y-4">

          <div>
            <label className="text-gray-300 text-sm">
              Nome da Empresa
            </label>

            <input
              value={dados.empresa || ""}
              onChange={(e) => onChange("empresa", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
              placeholder="VIME APP"
            />
          </div>

          <button
            onClick={onSalvar}
            disabled={salvando}
            className="
              mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition px-6 py-3 text-white
            "
          >
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>

        </div>

      </div>

    </div>
  );
}
