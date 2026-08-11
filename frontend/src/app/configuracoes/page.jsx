"use client";

import { useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import FadeIn from "../components/ui/FadeIn";

import ConfiguracoesHeader from "../components/configuracoes/ConfiguracoesHeader";
import ConfiguracoesStats from "../components/configuracoes/ConfiguracoesStats";
import PainelRapido from "../components/configuracoes/PainelRapido";

import EmpresaCard from "../components/configuracoes/EmpresaCard";
import LogoCard from "../components/configuracoes/LogoCard";
import TemaCard from "../components/configuracoes/TemaCard";
import PersonalizacaoCard from "../components/configuracoes/PersonalizacaoCard";

import SistemaCard from "../components/configuracoes/SistemaCard";
import IntegracoesCard from "../components/configuracoes/IntegracoesCard";
import SMTPCard from "../components/configuracoes/SMTPCard";
import BancoDadosCard from "../components/configuracoes/BancoDadosCard";
import BackupCard from "../components/configuracoes/BackupCard";
import SegurancaCard from "../components/configuracoes/SegurancaCard";
import LicencaCard from "../components/configuracoes/LicencaCard";
import HistoricoCard from "../components/configuracoes/HistoricoCard";

export default function ConfiguracoesPage() {
  const [dados, setDados] = useState({
    nomeSistema: "VIME APP 2.0",
    corPrincipal: "#10B981",
    corSecundaria: "#1E293B",
  });

  function alterar(campo, valor) {
    setDados((old) => ({
      ...old,
      [campo]: valor,
    }));
  }

  function salvar() {
    console.log(dados);
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <FadeIn delay={0}>
          <ConfiguracoesHeader />
        </FadeIn>

        {/* Dashboard */}
        <FadeIn delay={0.10}>
          <ConfiguracoesStats />
        </FadeIn>

        {/* Conteúdo */}
        <FadeIn delay={0.20}>
          <div className="grid gap-6 xl:grid-cols-3">
            {/* Coluna Principal */}
            <div className="space-y-6 xl:col-span-2">
              <EmpresaCard
                dados={dados}
                onChange={alterar}
                onSalvar={salvar}
              />

              <LogoCard />

              <TemaCard
                dados={dados}
                onChange={alterar}
                onSalvar={salvar}
              />

              <PersonalizacaoCard
                dados={dados}
                onChange={alterar}
                onSalvar={salvar}
              />

              <SistemaCard />

              <IntegracoesCard />

              <SMTPCard />

              <BancoDadosCard />

              <BackupCard />

              <SegurancaCard />

              <LicencaCard />

              <HistoricoCard />
            </div>

            {/* Coluna Lateral */}
            <div>
              <div className="sticky top-24">
                <PainelRapido />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </MainLayout>
  );
}