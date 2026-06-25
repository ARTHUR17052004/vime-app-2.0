"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [menuAberto, setMenuAberto] =
    useState(null);

  const unidades = JSON.parse(
    localStorage.getItem("vime-unidades") ||
      "[]"
  );

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
          <div
            key={locador.id}
            className="
              relative
              bg-white
              rounded-3xl
              shadow
              border
              border-gray-100
              p-6
            "
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-green-100
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Building2 className="w-6 h-6 text-green-700" />
                </div>

                <div>
                  <h2 className="font-bold text-xl text-gray-800">
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
                      bg-blue-100
                      text-blue-700
                    "
                  >
                    {locador.tipoPessoa ===
                    "PJ"
                      ? "Pessoa Jurídica"
                      : "Pessoa Física"}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  setMenuAberto(
                    menuAberto ===
                      locador.id
                      ? null
                      : locador.id
                  )
                }
              >
                <MoreVertical className="text-gray-500" />
              </button>
            </div>

            {menuAberto ===
              locador.id && (
              <div
                className="
                  absolute
                  right-5
                  top-14
                  bg-white
                  border
                  rounded-xl
                  shadow-xl
                  z-50
                  w-40
                "
              >
                <Link
                  href={`/locadores/${locador.id}`}
                  className="
                    block
                    px-4
                    py-3
                    hover:bg-gray-100
                  "
                >
                  Visualizar
                </Link>

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
                    hover:bg-yellow-50
                    text-yellow-700
                  "
                >
                  Editar
                </button>

                <button
                  onClick={() => {
                    setMenuAberto(null);
                    onDelete?.(
                      locador.id
                    );
                  }}
                  className="
                    w-full
                    text-left
                    px-4
                    py-3
                    hover:bg-red-50
                    text-red-700
                  "
                >
                  Excluir
                </button>
              </div>
            )}

            <div className="mt-6 space-y-3 text-gray-600">
              <div className="flex items-center gap-3">
                <CreditCard size={18} />
                <span>
                  {locador.documento}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>
                  {locador.email ||
                    "-"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} />
                <span>
                  {locador.telefone ||
                    "-"}
                </span>
              </div>
            </div>

            <div className="border-t mt-5 pt-5">
              <div className="text-gray-600 font-medium">
                {totalUnidades} unidade(s)
                vinculada(s)
              </div>

              <div className="mt-3 text-sm text-blue-600">
                Taxa Adm.:{" "}
                {locador.taxaAdministracao ||
                  0}
                % | Multa:{" "}
                {locador.multa || 0}% |
                Juros:{" "}
                {locador.juros || 0}% a.m.
              </div>

              <button
                className="
                  w-full
                  mt-5
                  border
                  border-blue-200
                  rounded-xl
                  py-3
                  text-blue-700
                  hover:bg-blue-50
                "
              >
                Criar Subconta Asaas
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}