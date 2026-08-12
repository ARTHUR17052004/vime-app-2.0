"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";

import MainLayout from "../../components/layout/MainLayout";

import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";

import UsuariosHeader from "../../components/administracao/UsuariosHeader";
import UsuariosStats from "../../components/administracao/UsuariosStats";
import UsuariosFilters from "../../components/administracao/UsuariosFilters";
import UsuariosTable from "../../components/administracao/UsuariosTable";
import UsuariosModal from "../../components/administracao/UsuariosModal";

import { UsuarioService } from "@/services/usuarios.service";

export default function UsuariosPage() {

  const [usuarios, setUsuarios] = useState([]);

  const [loading, setLoading] = useState(true);

  const [erro, setErro] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [busca, setBusca] = useState("");

  /* ==========================================
     CARREGAR DADOS
  ========================================== */

  const carregarUsuarios = useCallback(async () => {

    try {

      setLoading(true);

      const resposta = await UsuarioService.listar();

      const lista = Array.isArray(resposta)

        ? resposta

        : resposta.data || [];

      setUsuarios(lista);

    } catch (err) {

      console.error(err);

      setErro(

        err.message ||

        "Erro ao carregar usuários."

      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    carregarUsuarios();

  }, [carregarUsuarios]);

  /* ==========================================
     CRUD
  ========================================== */

  async function salvarUsuario(dados) {

  try {

    if (usuarioEditando) {

      await UsuarioService.atualizar(
        usuarioEditando.id,
        dados
      );

    } else {

      await UsuarioService.criar(dados);

    }

    await carregarUsuarios();

    setUsuarioEditando(null);

    setModalOpen(false);

  } catch (err) {

    alert(
      err.message ||
      "Erro ao salvar usuário."
    );

    throw err;

  }

}

  function novoUsuario() {

    setUsuarioEditando(null);

    setModalOpen(true);

  }

  function editarUsuario(usuario) {

    setUsuarioEditando(usuario);

    setModalOpen(true);

  }

  async function excluirUsuario(id) {

    const confirmar = window.confirm(

      "Deseja realmente excluir este usuário?"

    );

    if (!confirmar) return;

    try {

      await UsuarioService.excluir(id);

      await carregarUsuarios();

    } catch (err) {

      console.error(err);

      alert(

        err.message ||

        "Erro ao excluir usuário."

      );

    }

  }

  async function enviarAcesso(usuario) {

    try {

      await UsuarioService.enviarAcesso(

        usuario.id

      );

      alert(

        "Convite enviado com sucesso."

      );

    } catch (err) {

      console.error(err);

      alert(

        err.message ||

        "Erro ao enviar acesso."

      );

    }

  }

  async function redefinirSenha(usuario) {

  const novaSenha = prompt(
    `Digite a nova senha para ${usuario.nome}:`
  );

  if (!novaSenha) return;

  try {

    await UsuarioService.redefinirSenha(
      usuario.id,
      novaSenha
    );

    alert("Senha redefinida com sucesso.");

  } catch (err) {

    console.error(err);

    alert(
      err.message ||
      "Erro ao redefinir senha."
    );

  }

}

  async function alterarStatus(usuario) {

    try {

      await UsuarioService.atualizar(

        usuario.id,

        {

          ativo: !usuario.ativo,

        }

      );

      await carregarUsuarios();

    } catch (err) {

      console.error(err);

      alert(

        err.message ||

        "Erro ao alterar status."

      );

    }

  }

  /* ==========================================
     FILTRO
  ========================================== */

  const usuariosFiltrados = useMemo(() => {

    if (!busca.trim()) {

      return usuarios;

    }

    const texto = busca.toLowerCase();

    return usuarios.filter((usuario) =>

      usuario.nome

        ?.toLowerCase()

        .includes(texto) ||

      usuario.email

        ?.toLowerCase()

        .includes(texto) ||

      usuario.perfil?.nome

        ?.toLowerCase()

        .includes(texto)

    );

  }, [

    usuarios,

    busca,

  ]);

  /* ==========================================
     DASHBOARD
  ========================================== */

  const totalUsuarios = usuarios.length;

  const ativos = usuarios.filter(

    (u) => u.ativo

  ).length;

  const inativos = usuarios.filter(

    (u) => !u.ativo

  ).length;

  const administradores = usuarios.filter(

    (u) =>

      u.perfil?.nome?.toUpperCase() === "ADMINISTRADOR"

  ).length;

  if (loading) {

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            <div className="flex items-center justify-center py-32">

              <p className="text-gray-400 text-lg">

                Carregando usuários...

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

          {erro && (

            <div
              className="
                mb-6
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/10
                px-5
                py-4
                text-red-300
              "
            >

              {erro}

            </div>

          )}

          <FadeIn>

            <UsuariosHeader

              totalUsuarios={totalUsuarios}

              onNovoUsuario={novoUsuario}

            />

          </FadeIn>

          <FadeIn delay={0.10}>

            <PageSection spacing="lg">

              <UsuariosFilters

                busca={busca}

                setBusca={setBusca}

              />

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.15}>

            <PageSection spacing="xl">

              <UsuariosStats

                total={totalUsuarios}

                ativos={ativos}

                inativos={inativos}

                administradores={administradores}

              />

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.20}>

            <PageSection spacing="xxl">

              <UsuariosTable

                usuarios={usuariosFiltrados}

                onEditar={editarUsuario}

                onExcluir={excluirUsuario}

                onEnviarAcesso={enviarAcesso}

                onRedefinirSenha={redefinirSenha}

                onAlterarStatus={alterarStatus}

              />

            </PageSection>

          </FadeIn>
                    <UsuariosModal

            isOpen={modalOpen}

            usuario={usuarioEditando}

            onClose={() => {

              setUsuarioEditando(null);

              setModalOpen(false);

            }}

            onSave={salvarUsuario}

          />

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
