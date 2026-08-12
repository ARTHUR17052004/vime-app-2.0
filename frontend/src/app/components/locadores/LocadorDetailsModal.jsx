"use client";

import Modal from "../ui/Modal";
import Button from "../ui/Button";

import {
  Building2,
  Mail,
  Phone,
  CreditCard,
  Landmark,
  Wallet,
  BadgePercent,
  FileText,
} from "lucide-react";

export default function LocadorDetailsModal({
  open,
  onClose,
  locador,
}) {

  if (!locador) return null;

  return (

    <Modal
      open={open}
      onClose={onClose}
      size="xl"
    >

      <div className="space-y-8">

        {/* Cabeçalho */}

        <div>

          <h2 className="text-3xl font-bold text-white">

            Detalhes do Locador

          </h2>

          <p className="mt-2 text-gray-400">

            Informações completas do proprietário.

          </p>

        </div>

        {/* Dados Gerais */}

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-6
          "
        >

          <h3 className="mb-6 text-xl font-semibold text-white">

            Dados Gerais

          </h3>

          <div className="grid grid-cols-2 gap-6">

            <div className="flex items-center gap-3">

              <Building2
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-gray-400">

                  Nome

                </p>

                <p className="text-white font-medium">

                  {locador.nome}

                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <CreditCard
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-gray-400">

                  CPF / CNPJ

                </p>

                <p className="text-white font-medium">

                  {locador.documento || locador.cpfCnpj || "-"}

                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <Mail
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-gray-400">

                  E-mail

                </p>

                <p className="text-white font-medium">

                  {locador.email || "-"}

                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <Phone
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-gray-400">

                  Telefone

                </p>

                <p className="text-white font-medium">

                  {locador.telefone || "-"}

                </p>

              </div>

            </div>

          </div>

        </div>
                {/* Dados Bancários */}

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-6
          "
        >

          <h3 className="mb-6 text-xl font-semibold text-white">

            Dados Bancários

          </h3>

          <div className="grid grid-cols-2 gap-6">

            <div className="flex items-center gap-3">

              <Landmark
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-gray-400">

                  Banco

                </p>

                <p className="text-white font-medium">

                  {locador.banco || "-"}

                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <Wallet
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-gray-400">

                  Agência

                </p>

                <p className="text-white font-medium">

                  {locador.agencia || "-"}

                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <Wallet
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-gray-400">

                  Conta

                </p>

                <p className="text-white font-medium">

                  {locador.conta || "-"}

                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <Wallet
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-gray-400">

                  PIX

                </p>

                <p className="text-white font-medium break-all">

                  {locador.pix || "-"}

                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Financeiro */}

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-6
          "
        >

          <h3 className="mb-6 text-xl font-semibold text-white">

            Configurações Financeiras

          </h3>

          <div className="grid grid-cols-3 gap-6">

            <div className="flex items-center gap-3">

              <BadgePercent
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-gray-400">

                  Taxa Administração

                </p>

                <p className="text-white font-medium">

                  {locador.taxaAdministracao || 0}%

                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <BadgePercent
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-gray-400">

                  Multa

                </p>

                <p className="text-white font-medium">

                  {locador.multa || 0}%

                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <BadgePercent
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-gray-400">

                  Juros

                </p>

                <p className="text-white font-medium">

                  {locador.juros || 0}% a.m.

                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Observações */}

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-6
          "
        >

          <div className="flex items-center gap-3 mb-4">

            <FileText
              className="text-emerald-400"
              size={20}
            />

            <h3 className="text-xl font-semibold text-white">

              Observações

            </h3>

          </div>

          <p className="text-gray-300 whitespace-pre-wrap">

            {locador.observacoes || "Nenhuma observação cadastrada."}

          </p>

        </div>
                <div
          className="
            flex
            justify-end
            pt-2
          "
        >

          <Button
            onClick={onClose}
          >
            Fechar
          </Button>

        </div>

      </div>

    </Modal>

  );

}