"use client";

import { useEffect, useState } from "react";

import DashboardCard from "../dashboard/DashboardCard";
import { useAuth } from "../../../context/AuthContext";
import { AuthService } from "../../../services/auth.service";

export default function ProfileInfo() {
  const { usuario, setUsuario } = useAuth();

  const [form, setForm] = useState({ nome: "", email: "" });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!usuario) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      nome: usuario.nome || "",
      email: usuario.email || "",
    });
  }, [usuario]);

  async function salvar(e) {
    e.preventDefault();

    try {
      setSalvando(true);

      const resposta = await AuthService.atualizarPerfil(form);
      const atualizado = resposta.data || resposta;

      const usuarioAtualizado = { ...usuario, ...atualizado };

      setUsuario(usuarioAtualizado);
      localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));

      alert("Perfil atualizado com sucesso.");
    } catch (error) {
      console.error(error);
      alert(error.message || "Erro ao atualizar perfil.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <DashboardCard>

      <div>

        <p
          className="
            text-xs
            uppercase
            tracking-[0.35em]
            text-emerald-400
            font-semibold
          "
        >
          Informações
        </p>

        <h2
          className="
            mt-2
            text-2xl
            font-bold
            text-[var(--text)]
          "
        >
          Dados da Conta
        </h2>

      </div>

      <form onSubmit={salvar} className="mt-8 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <CampoEditavel
            label="Nome"
            value={form.nome}
            onChange={(v) => setForm((prev) => ({ ...prev, nome: v }))}
          />

          <CampoEditavel
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(v) => setForm((prev) => ({ ...prev, email: v }))}
          />

          <InfoItem
            label="Perfil"
            value={usuario?.perfil || "-"}
          />

          <InfoItem
            label="Status"
            value={usuario?.ativo === false ? "Inativo" : "Ativo"}
            valueClass={
              usuario?.ativo === false
                ? "text-red-400"
                : "text-emerald-400"
            }
          />

        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={salvando}
            className="
              bg-emerald-600
              hover:bg-emerald-700
              disabled:opacity-50
              text-[var(--text)]
              px-6
              py-3
              rounded-xl
              font-semibold
              transition-all
            "
          >
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>

      </form>

    </DashboardCard>
  );
}

function CampoEditavel({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div>

      <p
        className="
          text-xs
          uppercase
          tracking-wider
          text-[var(--text-faint)]
        "
      >
        {label}
      </p>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="
          mt-2
          w-full

          rounded-2xl

          border
          border-[var(--border-token)]

          bg-[var(--surface-2)]

          px-5
          py-4

          text-lg
          font-semibold
          text-[var(--text)]

          outline-none

          focus:border-emerald-500
          focus:ring-2
          focus:ring-emerald-500/20

          transition-all
        "
      />

    </div>
  );
}

function InfoItem({
  label,
  value,
  valueClass = "text-[var(--text)]",
}) {
  return (
    <div>

      <p
        className="
          text-xs
          uppercase
          tracking-wider
          text-[var(--text-faint)]
        "
      >
        {label}
      </p>

      <div
        className="
          mt-2

          rounded-2xl

          border
          border-[var(--border-token)]

          bg-[var(--surface-2)]

          px-5
          py-4
        "
      >
        <span
          className={`
            text-lg
            font-semibold
            ${valueClass}
          `}
        >
          {value}
        </span>

      </div>

    </div>
  );
}
