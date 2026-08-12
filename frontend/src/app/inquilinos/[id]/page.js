"use client";

import { useEffect, useState, useCallback } from "react";

import { useParams } from "next/navigation";

import MainLayout from "../../components/layout/MainLayout";

import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import PageSection from "../../components/ui/PageSection";
import Card from "../../components/ui/Card";

import { InquilinoService } from "../../../services/inquilinos.service";

export default function InquilinoDetalhesPage() {

  const { id } = useParams();

  const [inquilino, setInquilino] = useState(null);

  const [loading, setLoading] = useState(true);

  const [erro, setErro] = useState("");

  const carregarInquilino = useCallback(async () => {

    try {

      setLoading(true);

      const resposta = await InquilinoService.buscar(id);

      setInquilino(resposta.data || resposta);

    } catch (err) {

      console.error(err);

      setErro(
        err.message ||
        "Erro ao carregar inquilino."
      );

    } finally {

      setLoading(false);

    }

  }, [id]);

  useEffect(() => {

    if (id) {

      // eslint-disable-next-line react-hooks/set-state-in-effect
      carregarInquilino();

    }

  }, [id, carregarInquilino]);

  if (loading) {

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            <div className="flex justify-center py-32">

              <p className="text-gray-400">

                Carregando...

              </p>

            </div>

          </PageContainer>

        </Page>

      </MainLayout>

    );

  }

  if (erro || !inquilino) {

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            <div className="text-red-400">

              {erro || "Inquilino não encontrado."}

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
            title={inquilino.nome}
            subtitle="Detalhes do Inquilino"
          />

          <PageSection>

            <Card>

              <div className="grid md:grid-cols-2 gap-8">

                <Info
                  label="Nome"
                  value={inquilino.nome}
                />

                <Info
                  label="CPF"
                  value={inquilino.cpf}
                />

                <Info
                  label="RG"
                  value={inquilino.rg}
                />

                <Info
                  label="E-mail"
                  value={inquilino.email}
                />

                <Info
                  label="Telefone"
                  value={inquilino.telefone}
                />

                <Info
                  label="Data de Nascimento"
                  value={
                    inquilino.dataNascimento
                      ? new Date(
                          inquilino.dataNascimento
                        ).toLocaleDateString("pt-BR")
                      : "-"
                  }
                />

                <Info
                  label="Endereço Anterior"
                  value={inquilino.enderecoAnterior}
                />

                <Info
                  label="Contato de Emergência"
                  value={inquilino.contatoEmergencia}
                />

                <Info
                  label="Telefone de Emergência"
                  value={inquilino.telefoneEmergencia}
                />

                <Info
                  label="Kitnet"
                  value={inquilino.kitnet?.nome || inquilino.kitnetNome || "-"}
                />

                <Info
                  label="Unidade"
                  value={inquilino.kitnet?.unidade?.nome || inquilino.unidadeNome || "-"}
                />

                <Info
                  label="Início do Contrato"
                  value={
                    inquilino.dataInicioContrato
                      ? new Date(
                          inquilino.dataInicioContrato
                        ).toLocaleDateString("pt-BR")
                      : "-"
                  }
                />

                <Info
                  label="Fim do Contrato"
                  value={
                    inquilino.dataFimContrato
                      ? new Date(
                          inquilino.dataFimContrato
                        ).toLocaleDateString("pt-BR")
                      : "-"
                  }
                />

                <Info
                  label="Prazo do Contrato"
                  value={
                    inquilino.prazoContrato
                      ? `${inquilino.prazoContrato} meses`
                      : "-"
                  }
                />

                <Info
                  label="Tipo de Garantia"
                  value={inquilino.tipoGarantia}
                />

                <Info
                  label="Valor da Caução"
                  value={
                    inquilino.valorCaucao
                      ? `R$ ${inquilino.valorCaucao}`
                      : "-"
                  }
                />

                <Info
                  label="Índice de Reajuste"
                  value={inquilino.indiceReajuste}
                />

                <Info
                  label="Status"
                  value={
                    inquilino.ativo
                      ? "Ativo"
                      : "Inativo"
                  }
                />

              </div>

            </Card>

          </PageSection>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}

function Info({ label, value }) {

  return (

    <div>

      <p className="text-sm text-gray-400">

        {label}

      </p>

      <p className="text-lg font-semibold text-white">

        {value || "-"}

      </p>

    </div>

  );

}