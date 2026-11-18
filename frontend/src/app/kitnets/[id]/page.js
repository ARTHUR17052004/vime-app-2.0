"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Building2,
  DoorOpen,
  Ruler,
  Wallet,
  CheckCircle2,
  FileText,
  ArrowLeft,
  Pencil,
} from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import SemPermissao from "../../components/ui/SemPermissao";

import { KitnetService } from "../../../services/kitnets.service";
import { usePermissao } from "../../../hooks/usePermissao";

export default function KitnetDetalhesPage() {
  const params = useParams();
  const router = useRouter();

  const podeVisualizar = usePermissao("kitnets.visualizar");
  const podeEditar = usePermissao("kitnets.editar");

  const [kitnet, setKitnet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarKitnet() {
      try {
        const resposta = await KitnetService.listar();

        const lista = Array.isArray(resposta)
          ? resposta
          : resposta.data || [];

        const encontrada = lista.find(
          (item) => String(item.id) === params.id
        );

        setKitnet(encontrada || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      carregarKitnet();
    }
  }, [params.id]);

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  if (loading) {
    return (
      <MainLayout>
        <Page>
          <PageContainer>
            <div className="flex justify-center py-32">
              <p className="text-[var(--text-subtle)] text-lg">
                Carregando kitnet...
              </p>
            </div>
          </PageContainer>
        </Page>
      </MainLayout>
    );
  }

  if (!kitnet) {
    return (
      <MainLayout>
        <Page>
          <PageContainer>
            <div className="flex justify-center py-32">
              <p className="text-red-400 text-lg">
                Kitnet não encontrada.
              </p>
            </div>
          </PageContainer>
        </Page>
      </MainLayout>
    );
  }

  const inquilino = kitnet.inquilinos?.[0];
  const contratoAtivo = kitnet.contratos?.[0];

  return (
    <MainLayout>

      <Page>

        <PageContainer>

          <PageHeader
            title={kitnet.nome}
            subtitle="Detalhes da Kitnet"
            actions={
              <div className="flex gap-3">

                <Button
                  variant="secondary"
                  onClick={() => router.push("/kitnets")}
                >
                  <ArrowLeft size={18} />
                  Voltar
                </Button>

                {podeEditar && (
                  <Button
                    onClick={() =>
                      router.push("/kitnets")
                    }
                  >
                    <Pencil size={18} />
                    Editar
                  </Button>
                )}

              </div>
            }
          />

          <div
            className="
              mt-8

              rounded-3xl

              border
              border-[var(--border-token)]

              bg-[var(--surface)]

              backdrop-blur-xl

              shadow-xl

              overflow-hidden
            "
          >

            <InfoRowPar
              campos={[
                {
                  icon: <Building2 size={18} />,
                  label: "Residência",
                  value: kitnet.unidade?.nome || kitnet.unidadeNome || "-",
                },
                {
                  icon: <DoorOpen size={18} />,
                  label: "Número",
                  value: kitnet.numero,
                },
              ]}
            />

            <InfoRowPar
              campos={[
                {
                  icon: <Ruler size={18} />,
                  label: "Metragem",
                  value: `${kitnet.metragem} m²`,
                },
                {
                  icon: <Wallet size={18} />,
                  label: "Valor do Aluguel",
                  value: `R$ ${Number(
                    kitnet.aluguel || 0
                  ).toLocaleString("pt-BR")}`,
                  valueClassName: "text-emerald-400",
                },
              ]}
            />

            {/* Quem mora na kitnet agora + até quando vai o contrato --
                só faz sentido mostrar com a kitnet ocupada. Vazia, fica
                exatamente como antes (sem esse bloco). Inquilino vem da
                relação direta (sempre existe quando ocupada, mesmo sem
                um Contrato digital ainda gerado); a data vem do
                Contrato "Ativo" mais recente dessa kitnet, se houver. */}
            {kitnet.status === "OCUPADA" && inquilino && (
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4

                  px-8
                  py-6

                  border-b
                  border-[var(--border-token)]
                "
              >
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-[var(--text)] truncate">
                    {inquilino.nome}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-subtle)]">
                    CPF: {inquilino.cpf || "-"}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
                    Contrato
                  </p>
                  <p className="mt-1 text-sm font-medium text-[var(--text)]">
                    {formatarDataContrato(contratoAtivo?.dataFim)}
                  </p>
                </div>
              </div>
            )}

            <InfoRow
              icon={<CheckCircle2 size={20} />}
              label="Status"
              value={kitnet.status}
              badge
            />

            <InfoRow
              icon={<FileText size={20} />}
              label="Observações"
              value={
                kitnet.observacoes ||
                "Nenhuma observação cadastrada."
              }
              multiline
            />

          </div>

        </PageContainer>

      </Page>

    </MainLayout>
  );
}

// Data do Contrato vem do banco como timestamp (meia-noite UTC) --
// mesmo padrão já usado em AsaasTabela.jsx/formatarData -- sem o
// timeZone: "UTC" o dia exibido "volta" um dia num fuso atrás de UTC
// (Brasil).
function formatarDataContrato(data) {
  if (!data) return "Sem data de término";
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

// Duas informações lado a lado na mesma linha (ex.: Residência +
// Número) em vez de uma embaixo da outra -- mesmo visual do InfoRow,
// só dividido ao meio.
function InfoRowPar({ campos }) {
  return (
    <div
      className="
        grid
        grid-cols-2

        border-b
        border-[var(--border-token)]
      "
    >
      {campos.map((campo, indice) => (
        <div
          key={campo.label}
          className={`
            flex
            items-start
            gap-3

            px-5
            py-6

            ${indice === 0 ? "border-r border-[var(--border-token)]" : ""}
          `}
        >
          <div className="text-emerald-400 mt-1 shrink-0">
            {campo.icon}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-[var(--text-subtle)]">
              {campo.label}
            </p>
            <p
              className={`
                mt-2
                text-lg
                font-semibold
                text-[var(--text)]
                truncate

                ${campo.valueClassName || ""}
              `}
            >
              {campo.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  badge,
  multiline,
  valueClassName = "",
}) {
  return (
    <div
      className="
        flex

        items-start

        gap-5

        px-8
        py-6

        border-b
        border-[var(--border-token)]

        last:border-none
      "
    >
      <div className="text-emerald-400 mt-1">
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-sm text-[var(--text-subtle)]">
          {label}
        </p>

        {badge ? (
          <span
            className="
              inline-flex

              mt-2

              rounded-full

              bg-emerald-500/15

              px-3
              py-1

              text-sm
              font-semibold

              text-emerald-400
            "
          >
            {value}
          </span>
        ) : (
          <p
            className={`
              mt-2

              text-lg

              font-semibold

              text-[var(--text)]

              ${
                multiline
                  ? "whitespace-pre-wrap"
                  : ""
              }

              ${valueClassName}
            `}
          >
            {value}
          </p>
        )}

      </div>
    </div>
  );
}