"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Users,
  Shield,
  KeyRound,
  Activity,
  History,
  FileText,
  ListChecks,
} from "lucide-react";

import { useRouter } from "next/navigation";

import MainLayout from "../components/layout/MainLayout";

import FadeIn from "../components/ui/FadeIn";
import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageSection from "../components/ui/PageSection";
import Button from "../components/ui/Button";

import AdministracaoHeader from "../components/administracao/AdministracaoHeader";
import AdministracaoStats from "../components/administracao/AdministracaoStats";
import AdministracaoCard from "../components/administracao/AdministracaoCard";

import { UsuarioService } from "@/services/usuarios.service";
import { PerfilService } from "@/services/perfis.service";
import { SessaoService } from "@/services/sessao.service";
import { AuditoriaService } from "@/services/auditoria.service";
import { LogService } from "@/services/log.service";

function paraLista(resposta) {
  return Array.isArray(resposta)
    ? resposta
    : resposta?.data || [];
}

export default function AdministracaoPage() {

  const router = useRouter();

  const [totais, setTotais] = useState({
    usuarios: 0,
    perfis: 0,
    permissoes: 0,
    sessoes: 0,
    auditorias: 0,
    logs: 0,
  });

  const carregarTotais = useCallback(async () => {

    const [
      usuarios,
      perfis,
      sessoes,
      auditorias,
      logs,
    ] = await Promise.all([
      UsuarioService.listar().then(paraLista).catch(() => []),
      PerfilService.listar().then(paraLista).catch(() => []),
      SessaoService.listar().then(paraLista).catch(() => []),
      AuditoriaService.listar().then(paraLista).catch(() => []),
      LogService.listar().then(paraLista).catch(() => []),
    ]);

    const permissoesConcedidas = perfis.reduce(
      (total, perfil) =>
        total + (perfil.permissoes?.length || 0),
      0
    );

    setTotais({
      usuarios: usuarios.length,
      perfis: perfis.length,
      permissoes: permissoesConcedidas,
      sessoes: sessoes.length,
      auditorias: auditorias.length,
      logs: logs.length,
    });

  }, []);

  useEffect(() => {

    carregarTotais();

  }, [carregarTotais]);

  const cards = [

    {
      title: "Usuários",
      subtitle: "Usuários cadastrados",
      value: totais.usuarios,
      icon: Users,
      color: "emerald",
    },

    {
      title: "Perfis",
      subtitle: "Perfis cadastrados",
      value: totais.perfis,
      icon: Shield,
      color: "blue",
    },

    {
      title: "Permissões",
      subtitle: "Permissões concedidas",
      value: totais.permissoes,
      icon: KeyRound,
      color: "yellow",
    },

    {
      title: "Sessões",
      subtitle: "Usuários Online",
      value: totais.sessoes,
      icon: Activity,
      color: "purple",
    },

    {
      title: "Auditorias",
      subtitle: "Registros",
      value: totais.auditorias,
      icon: History,
      color: "emerald",
    },

    {
      title: "Logs",
      subtitle: "Eventos",
      value: totais.logs,
      icon: FileText,
      color: "red",
    },

  ];

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <AdministracaoHeader

              totalUsuarios={totais.usuarios}

              onNovoUsuario={() =>
                router.push("/administracao/usuarios")
              }

            />

          </FadeIn>

          <FadeIn delay={0.10}>

            <PageSection spacing="xl">

              <AdministracaoStats

                cards={cards}

              />

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.20}>

            <PageSection spacing="xxl">

              <div className="grid lg:grid-cols-3 gap-6">

                <AdministracaoCard

                  title="Usuários"

                  subtitle="Gerenciar usuários"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/usuarios")
                    }

                  >

                    Abrir Usuários

                  </Button>

                </AdministracaoCard>

                <AdministracaoCard

                  title="Perfis"

                  subtitle="Perfis de acesso"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/perfis")
                    }

                  >

                    Abrir Perfis

                  </Button>

                </AdministracaoCard>

                <AdministracaoCard

                  title="Permissões"

                  subtitle="Controle de acesso"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/permissoes")
                    }

                  >

                    Abrir Permissões

                  </Button>

                </AdministracaoCard>

                <AdministracaoCard

                  title="Sessões"

                  subtitle="Usuários conectados"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/sessoes")
                    }

                  >

                    Abrir Sessões

                  </Button>

                </AdministracaoCard>

                <AdministracaoCard

                  title="Auditoria"

                  subtitle="Histórico do sistema"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/auditoria")
                    }

                  >

                    Abrir Auditoria

                  </Button>

                </AdministracaoCard>

                <AdministracaoCard

                  title="Logs"

                  subtitle="Logs internos"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/logs")
                    }

                  >

                    Abrir Logs

                  </Button>

                </AdministracaoCard>

                <AdministracaoCard

                  title="Modelos de Documentos"

                  subtitle="Modelo de PDF do contrato"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/modelos")
                    }

                  >

                    Abrir Modelos

                  </Button>

                </AdministracaoCard>

                <AdministracaoCard

                  title="Campos Obrigatórios"

                  subtitle="Defina o que é obrigatório em cada cadastro"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/campos-obrigatorios")
                    }

                  >

                    Abrir Campos Obrigatórios

                  </Button>

                </AdministracaoCard>

              </div>

            </PageSection>

          </FadeIn>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}