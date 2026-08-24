/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useCallback, useEffect, useState } from "react";

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

import { ConfiguracaoService } from "@/services/configuracao.service";

const PADRAO = {
  empresa: "VIME APP 2.0",
  cnpj: "",
  telefone: "",
  email: "",
  endereco: "",
  cidade: "",
  uf: "",
  cep: "",
  logo: "",
  tema: "claro",
  corPrimaria: "#10B981",
  corSecundaria: "#1E293B",
  nomeSistema: "",
  nomeEmpresa: "",
  textoLogin: "",
  textoRodape: "",
  mensagemBoasVindas: "",
  smtpHost: "",
  smtpPorta: "",
  smtpUsuario: "",
  smtpSenha: "",
  asaasToken: "",
  clicksignToken: "",
  whatsappToken: "",
  whatsappNumero: "",
  manutencaoAtiva: false,
  manutencaoMensagem: "",
};

export default function ConfiguracoesPage() {
  const [dados, setDados] = useState(PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {

    try {

      setCarregando(true);

      const resposta = await ConfiguracaoService.listar();

      const lista = Array.isArray(resposta)
        ? resposta
        : resposta.data || [];

      if (lista.length > 0) {
        setDados({ ...PADRAO, ...lista[0] });
      }

    } catch (err) {

      console.error("Erro ao carregar configurações:", err);

    } finally {

      setCarregando(false);

    }

  }, []);

  useEffect(() => {

    carregar();

  }, [carregar]);

  function alterar(campo, valor) {
    setDados((old) => ({
      ...old,
      [campo]: valor,
    }));
  }

  async function salvar() {

    setSalvando(true);

    try {

      const payload = {
        ...dados,
        smtpPorta: dados.smtpPorta ? Number(dados.smtpPorta) : null,
      };

      delete payload.id;
      delete payload.createdAt;
      delete payload.updatedAt;

      if (dados.id) {
        await ConfiguracaoService.atualizar(dados.id, payload);
      } else {
        const resposta = await ConfiguracaoService.criar(payload);
        const criada = resposta.data || resposta;
        setDados((old) => ({ ...old, id: criada.id }));
      }

      alert("Configurações salvas com sucesso.");

    } catch (err) {

      alert(
        err.message ||
        "Erro ao salvar configurações."
      );

    } finally {

      setSalvando(false);

    }

  }

  if (carregando) {
    return (
      <MainLayout>
        <div className="py-32 text-center text-[var(--text-subtle)]">
          Carregando configurações...
        </div>
      </MainLayout>
    );
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
                salvando={salvando}
              />

              <LogoCard
                dados={dados}
                onChange={alterar}
                onSalvar={salvar}
                salvando={salvando}
              />

              <TemaCard
                dados={dados}
                onChange={alterar}
                onSalvar={salvar}
                salvando={salvando}
              />

              <PersonalizacaoCard
                dados={dados}
                onChange={alterar}
                onSalvar={salvar}
                salvando={salvando}
              />

              <SistemaCard />

              <IntegracoesCard
                dados={dados}
              />

              <SMTPCard
                dados={dados}
                onChange={alterar}
                onSalvar={salvar}
                salvando={salvando}
              />

              <BancoDadosCard />

              <BackupCard />

              <SegurancaCard
                dados={dados}
                onChange={alterar}
                onSalvar={salvar}
                salvando={salvando}
              />

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