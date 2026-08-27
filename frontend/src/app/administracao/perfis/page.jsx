"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import MainLayout from "../../components/layout/MainLayout";

import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";

import PerfilTable from "./components/PerfilTable";
import PerfilModal from "./components/PerfilModal";
import SemPermissao from "../../components/ui/SemPermissao";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { PerfilService } from "@/services/perfis.service";
import { usePermissao } from "../../../hooks/usePermissao";

export default function PerfisPage() {

  const podeVisualizar = usePermissao("perfis.visualizar");
  const podeCriar = usePermissao("perfis.criar");
  const podeEditar = usePermissao("perfis.editar");
  const podeExcluir = usePermissao("perfis.excluir");

  const [perfis, setPerfis] = useState([]);

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [perfilEditando, setPerfilEditando] = useState(null);

  const carregarPerfis = useCallback(async () => {

    try {

      setLoading(true);

      const resposta = await PerfilService.listar();

      setPerfis(resposta.data || []);

    } catch (err) {

      console.error(err);

      setErro("Erro ao carregar perfis.");

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    carregarPerfis();

  }, [carregarPerfis]);

  async function salvarPerfil(dados) {

    try {

      if (perfilEditando) {

        await PerfilService.atualizar(
          perfilEditando.id,
          dados
        );

      } else {

        await PerfilService.criar(dados);

      }

      setModalOpen(false);

      setPerfilEditando(null);

      carregarPerfis();

    } catch (err) {

      alert(err.message);

    }

  }

  async function excluirPerfil(id) {

    if (!confirm("Excluir perfil?")) return;

    try {

      await PerfilService.excluir(id);

      carregarPerfis();

    } catch (err) {

      alert(err.message);

    }

  }

  async function alterarStatus(perfil) {

    await PerfilService.atualizar(perfil.id, {

      ativo: !perfil.ativo

    });

    carregarPerfis();

  }

  const lista = useMemo(() => {

    if (!busca.trim()) return perfis;

    return perfis.filter((p) =>

      p.nome.toLowerCase().includes(busca.toLowerCase())

    );

  }, [perfis, busca]);

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  if (loading)

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            Carregando...

          </PageContainer>

        </Page>

      </MainLayout>

    );

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-5xl font-black text-[var(--text)]">
                    Perfis
                    </h1>

                    <p className="text-[var(--text-subtle)]">
                    Gerenciamento de Perfis
                    </p>

                </div>

                <div className="flex gap-3">

                    <button
                    onClick={() => router.back()}
                    className="
                        px-5
                        py-3
                        rounded-xl
                        bg-[var(--surface-3)]
                        hover:bg-[var(--surface-3)]
                        text-[var(--text)]
                        flex
                        items-center
                        gap-2
                    "
                    >
                    <ArrowLeft size={18}/>
                    Voltar
                    </button>

                    {podeCriar && (
                    <button
                    onClick={()=>{
                        setPerfilEditando(null);
                        setModalOpen(true);
                    }}
                    className="
                        px-5
                        py-3
                        rounded-xl
                        bg-emerald-500
                        hover:bg-emerald-600
                        text-[var(--text)]
                        font-bold
                    "
                    >
                    Novo Perfil
                    </button>
                    )}

                </div>

                </div>

          </FadeIn>

          <PageSection spacing="lg">

            <input

              className="w-full rounded-xl bg-[var(--surface-2)] p-3"

              placeholder="Pesquisar..."

              value={busca}

              onChange={(e)=>setBusca(e.target.value)}

            />

          </PageSection>

          {erro &&

            <div className="text-red-400 mb-5">

              {erro}

            </div>

          }

          <PageSection spacing="xxl">

            <PerfilTable

              perfis={lista}

              onEditar={(perfil)=>{

                setPerfilEditando(perfil);

                setModalOpen(true);

              }}

              onExcluir={excluirPerfil}

              onStatus={alterarStatus}

              podeEditar={podeEditar}

              podeExcluir={podeExcluir}

            />

          </PageSection>

          <PerfilModal

            isOpen={modalOpen}

            perfil={perfilEditando}

            onClose={()=>{

              setModalOpen(false);

              setPerfilEditando(null);

            }}

            onSave={salvarPerfil}

          />

        </PageContainer>

      </Page>

    </MainLayout>

  );

}