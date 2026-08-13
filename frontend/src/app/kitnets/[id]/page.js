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

import { KitnetService } from "../../../services/kitnets.service";

export default function KitnetDetalhesPage() {
  const params = useParams();
  const router = useRouter();

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

  if (loading) {
    return (
      <MainLayout>
        <Page>
          <PageContainer>
            <div className="flex justify-center py-32">
              <p className="text-gray-400 text-lg">
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
                  onClick={() => router.back()}
                >
                  <ArrowLeft size={18} />
                  Voltar
                </Button>

                <Button
                  onClick={() =>
                    router.push("/kitnets")
                  }
                >
                  <Pencil size={18} />
                  Editar
                </Button>

              </div>
            }
          />

          <div
            className="
              mt-8

              rounded-3xl

              border
              border-white/10

              bg-gradient-to-br
              from-[#1b2728]/80
              via-[#1a242c]/75
              to-[#151d26]/80

              backdrop-blur-xl

              shadow-xl

              overflow-hidden
            "
          >

            <InfoRow
              icon={<Building2 size={20} />}
              label="Residência"
              value={kitnet.unidade?.nome || kitnet.unidadeNome || "-"}
            />

            <InfoRow
              icon={<DoorOpen size={20} />}
              label="Número"
              value={kitnet.numero}
            />

            <InfoRow
              icon={<Ruler size={20} />}
              label="Metragem"
              value={`${kitnet.metragem} m²`}
            />

            <InfoRow
              icon={<Wallet size={20} />}
              label="Valor do Aluguel"
              value={`R$ ${Number(
                kitnet.aluguel || 0
              ).toLocaleString("pt-BR")}`}
              valueClassName="text-emerald-400"
            />

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
        border-white/5

        last:border-none
      "
    >
      <div className="text-emerald-400 mt-1">
        {icon}
      </div>

      <div className="flex-1">

        <p className="text-sm text-gray-400">
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

              text-white

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