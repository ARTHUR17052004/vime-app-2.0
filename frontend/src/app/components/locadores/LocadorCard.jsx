"use client";
import LocadorDetailsModal from "./LocadorDetailsModal";
import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardCard from "../dashboard/DashboardCard"; 
import {
  Building2,
  Mail,
  Phone,
  CreditCard,
  MoreVertical,
} from "lucide-react";

export default function LocadorCard({
  locadores,
  onDelete,
  onEdit,
}) {

  const [locadorSelecionado, setLocadorSelecionado] =
    useState(null);

  const [menuAberto, setMenuAberto] =
    useState(null);

  const [unidades, setUnidades] =
    useState([]);

  useEffect(() => {

    const dados = JSON.parse(
      localStorage.getItem(
        "vime-unidades"
      ) || "[]"
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnidades(dados);

  }, []);

  if (locadores.length === 0) {

    return (

      <div className="bg-white rounded-2xl shadow p-10 text-center">

        <h2 className="text-2xl font-semibold text-gray-700 mb-3">

          Módulo Locadores

        </h2>

        <p className="text-gray-500">

          Nenhum locador cadastrado ainda.

        </p>

      </div>

    );

  }

  return (

    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

      {locadores.map((locador) => {

        const totalUnidades =
          unidades.filter(
            (u) =>
              String(u.locadorId) ===
              String(locador.id)
          ).length;

        return (

          <DashboardCard
            key={locador.id}
            className="
              relative
              h-full

              transition-all
              duration-300

              hover:-translate-y-1
  "
          >

            <div className="flex justify-between items-start">

              <div className="flex gap-3">

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-emerald-500/10
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Building2 className="w-6 h-6 text-emerald-400" />

                </div>

                <div>

                  <h2 className="font-bold text-2xl text-white">

                    {locador.nome}

                  </h2>

                  <span
                    className="
                      inline-block
                      mt-2
                      px-3
                      py-1
                      rounded-xl
                      text-sm
                      bg-emerald-500/10
                      text-emerald-400
                    "
                  >

                    {locador.tipoPessoa === "PJ"
                      ? "Pessoa Jurídica"
                      : "Pessoa Física"}

                  </span>

                </div>

              </div>

              <button
                onClick={() =>
                  setMenuAberto(
                    menuAberto === locador.id
                      ? null
                      : locador.id
                  )
                }
              >

                <MoreVertical className="text-gray-500" />

              </button>

            </div>

            {menuAberto === locador.id && (

              <div
                className="
                  absolute
                  right-2
                  top-12
                  w-48
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/10
                  bg-slate-900/95
                  backdrop-blur-xl
                  shadow-2xl
                  z-50
                "
              >

                <button
                  onClick={() => {

                    setMenuAberto(null);

                    setLocadorSelecionado(locador);

                  }}
                  className="
                    w-full
                    text-left
                    px-4
                    py-3
                    text-sm
                    text-white
                    hover:bg-emerald-500/10
                    transition-all
                  "
                >

                  Visualizar

                </button>

                <button
                  onClick={() => {
                    setMenuAberto(null);
                    onEdit?.(locador);
                  }}
                  className="
                    w-full
                    text-left
                    px-4
                    py-3
                    text-sm
                    text-white
                    hover:bg-emerald-500/10
                    transition-all
                  "
                >
                  Editar
                </button>

                <button
                  onClick={() => {

                    setMenuAberto(null);

                    onDelete?.(locador.id);

                  }}
                  className="
                    w-full
                    text-left
                    px-4
                    py-3
                    text-sm
                    text-white
                    hover:bg-red-500/10
                    transition-all
                  "
                >

                  Excluir

                </button>

              </div>

            )}

            <div className="mt-6 space-y-3 text-gray-300">

              <div className="flex items-center gap-3">

                <CreditCard size={18} />

                <span>

                  {locador.documento}

                </span>

              </div>

              <div className="flex items-center gap-3">

                <Mail size={18} />

                <span>

                  {locador.email || "-"}

                </span>

              </div>

              <div className="flex items-center gap-3">

                <Phone size={18} />

                <span>

                  {locador.telefone || "-"}

                </span>

              </div>

            </div>

            <div className="my-7 border-t border-white/5 pt-5">

              <div className="text-gray-300 font-medium">

                {totalUnidades} unidade(s) vinculada(s)

              </div>

              <div className="mt-3 text-sm text-emerald-400">

                Taxa Adm.: {locador.taxaAdministracao || 0}% |
                {" "}Multa: {locador.multa || 0}% |
                {" "}Juros: {locador.juros || 0}% a.m.

              </div>

              <button
                className="
                  w-full
                  mt-5
                  border
                border-emerald-500/20
                bg-emerald-500/10
                text-emerald-400
                hover:bg-emerald-500/20
                transition
                "
              >

                Criar Subconta Asaas

              </button>

            </div>
            
            <LocadorDetailsModal
              open={locadorSelecionado?.id === locador.id}
              locador={locadorSelecionado}
              onClose={() => setLocadorSelecionado(null)}
            />

          </DashboardCard>

        );

      })}

    </div>

  );

}