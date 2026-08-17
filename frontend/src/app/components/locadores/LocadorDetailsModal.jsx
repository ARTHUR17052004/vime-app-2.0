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

          <h2 className="text-3xl font-bold text-[var(--text)]">

            Detalhes do Locador

          </h2>

          <p className="mt-2 text-[var(--text-subtle)]">

            Informações completas do proprietário.

          </p>

        </div>

        {/* Dados Gerais */}

        <div
          className="
            rounded-3xl
            border
            border-[var(--border-token)]
            bg-[var(--surface-2)]
            p-6
          "
        >

          <h3 className="mb-6 text-xl font-semibold text-[var(--text)]">

            Dados Gerais

          </h3>

          <div className="grid grid-cols-2 gap-6">

            <div className="flex items-center gap-3">

              <Building2
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-[var(--text-subtle)]">

                  Nome

                </p>

                <p className="text-[var(--text)] font-medium">

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

                <p className="text-sm text-[var(--text-subtle)]">

                  CPF / CNPJ

                </p>

                <p className="text-[var(--text)] font-medium">

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

                <p className="text-sm text-[var(--text-subtle)]">

                  E-mail

                </p>

                <p className="text-[var(--text)] font-medium">

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

                <p className="text-sm text-[var(--text-subtle)]">

                  Telefone

                </p>

                <p className="text-[var(--text)] font-medium">

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
            border-[var(--border-token)]
            bg-[var(--surface-2)]
            p-6
          "
        >

          <h3 className="mb-6 text-xl font-semibold text-[var(--text)]">

            Dados Bancários

          </h3>

          <div className="grid grid-cols-2 gap-6">

            <div className="flex items-center gap-3">

              <Landmark
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-[var(--text-subtle)]">

                  Banco

                </p>

                <p className="text-[var(--text)] font-medium">

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

                <p className="text-sm text-[var(--text-subtle)]">

                  Agência

                </p>

                <p className="text-[var(--text)] font-medium">

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

                <p className="text-sm text-[var(--text-subtle)]">

                  Conta

                </p>

                <p className="text-[var(--text)] font-medium">

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

                <p className="text-sm text-[var(--text-subtle)]">

                  PIX

                </p>

                <p className="text-[var(--text)] font-medium break-all">

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
            border-[var(--border-token)]
            bg-[var(--surface-2)]
            p-6
          "
        >

          <h3 className="mb-6 text-xl font-semibold text-[var(--text)]">

            Configurações Financeiras

          </h3>

          <div className="grid grid-cols-3 gap-6">

            <div className="flex items-center gap-3">

              <BadgePercent
                className="text-emerald-400"
                size={20}
              />

              <div>

                <p className="text-sm text-[var(--text-subtle)]">

                  Taxa Administração

                </p>

                <p className="text-[var(--text)] font-medium">

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

                <p className="text-sm text-[var(--text-subtle)]">

                  Multa

                </p>

                <p className="text-[var(--text)] font-medium">

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

                <p className="text-sm text-[var(--text-subtle)]">

                  Juros

                </p>

                <p className="text-[var(--text)] font-medium">

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
            border-[var(--border-token)]
            bg-[var(--surface-2)]
            p-6
          "
        >

          <div className="flex items-center gap-3 mb-4">

            <FileText
              className="text-emerald-400"
              size={20}
            />

            <h3 className="text-xl font-semibold text-[var(--text)]">

              Observações

            </h3>

          </div>

          <p className="text-[var(--text-muted)] whitespace-pre-wrap">

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