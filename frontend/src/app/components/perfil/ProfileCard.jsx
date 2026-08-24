"use client";

import { useRef, useState } from "react";
import { Camera, UserCircle2, ShieldCheck } from "lucide-react";

import DashboardCard from "../dashboard/DashboardCard";
import { useAuth } from "../../../context/AuthContext";
import { AuthService } from "../../../services/auth.service";

// Redimensiona pra no máximo 300x300 e converte pra JPEG antes de
// mandar pro servidor -- uma foto de celular direto facilmente passa
// de alguns MB em base64, isso aqui evita.
function redimensionarImagem(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => {
      const img = new Image();

      img.onload = () => {
        const tamanho = 300;
        const canvas = document.createElement("canvas");
        canvas.width = tamanho;
        canvas.height = tamanho;

        const ctx = canvas.getContext("2d");

        const escala = Math.max(tamanho / img.width, tamanho / img.height);
        const w = img.width * escala;
        const h = img.height * escala;

        ctx.drawImage(img, (tamanho - w) / 2, (tamanho - h) / 2, w, h);

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };

      img.onerror = reject;
      img.src = leitor.result;
    };

    leitor.onerror = reject;
    leitor.readAsDataURL(arquivo);
  });
}

export default function ProfileCard() {
  const { usuario, setUsuario } = useAuth();
  const inputRef = useRef(null);
  const [enviando, setEnviando] = useState(false);

  const nome = usuario?.nome || "Visitante";
  const email = usuario?.email || "Sem e-mail";
  const perfil = usuario?.perfil || "SEM PERFIL";

  const inicial = nome.charAt(0).toUpperCase();

  async function selecionarFoto(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    try {
      setEnviando(true);

      const dataUrl = await redimensionarImagem(arquivo);

      const resposta = await AuthService.atualizarPerfil({ foto: dataUrl });
      const atualizado = resposta.data || resposta;

      const usuarioAtualizado = { ...usuario, ...atualizado };

      setUsuario(usuarioAtualizado);
      localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));

    } catch (error) {
      console.error(error);
      alert(error.message || "Erro ao atualizar foto de perfil.");
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  }

  return (
    <DashboardCard>

      <div className="flex flex-col items-center text-center">

        <div className="relative">

          <div
            className="
              w-28
              h-28

              rounded-full

              bg-linear-to-br
              from-emerald-500
              to-green-700

              flex
              items-center
              justify-center

              text-5xl
              font-bold
              text-[var(--text)]

              shadow-xl
              shadow-emerald-900/40

              overflow-hidden
            "
          >
            {usuario?.foto ? (
              <img
                src={usuario.foto}
                alt={nome}
                className="w-full h-full object-cover"
              />
            ) : (
              inicial
            )}
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
            title="Trocar foto"
            className="
              absolute
              bottom-0
              right-0

              w-9
              h-9

              rounded-full

              bg-emerald-600
              hover:bg-emerald-700

              border-2
              border-[var(--surface)]

              flex
              items-center
              justify-center

              text-[var(--text)]

              disabled:opacity-50

              transition
            "
          >
            <Camera size={16} />
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={selecionarFoto}
            className="hidden"
          />

        </div>

        <h2
          className="
            mt-6

            text-2xl
            font-bold

            text-[var(--text)]
          "
        >
          {nome}
        </h2>

        <p className="mt-2 text-[var(--text-subtle)]">
          {email}
        </p>

        <div
          className="
            mt-6

            inline-flex

            items-center

            gap-2

            rounded-full

            bg-emerald-500/15

            border
            border-emerald-500/20

            px-4
            py-2

            text-emerald-400

            text-sm

            font-semibold
          "
        >
          <ShieldCheck size={16} />

          {perfil}
        </div>

      </div>

      <div className="mt-10 border-t border-[var(--border-token)] pt-8">

        <div className="flex items-center gap-3 text-[var(--text-muted)]">

          <UserCircle2 size={20} />

          Conta ativa

        </div>

      </div>

    </DashboardCard>
  );
}
