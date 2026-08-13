/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

import { PerfilService } from "@/services/perfis.service";

const CATALOGO = [
  {
    modulo: "Usuários",
    chave: "usuarios",
    acoes: ["visualizar", "criar", "editar", "excluir"],
  },
  {
    modulo: "Perfis",
    chave: "perfis",
    acoes: ["visualizar", "criar", "editar", "excluir"],
  },
  {
    modulo: "Permissões",
    chave: "permissoes",
    acoes: ["visualizar", "editar"],
  },
  {
    modulo: "Locadores",
    chave: "locadores",
    acoes: ["visualizar", "criar", "editar", "excluir"],
  },
  {
    modulo: "Residências",
    chave: "unidades",
    acoes: ["visualizar", "criar", "editar", "excluir"],
  },
  {
    modulo: "Kitnets",
    chave: "kitnets",
    acoes: ["visualizar", "criar", "editar", "excluir"],
  },
  {
    modulo: "Inquilinos",
    chave: "inquilinos",
    acoes: ["visualizar", "criar", "editar", "excluir"],
  },
  {
    modulo: "Contratos",
    chave: "contratos",
    acoes: ["visualizar", "criar", "editar", "excluir"],
  },
  {
    modulo: "Financeiro",
    chave: "financeiro",
    acoes: ["visualizar", "editar", "exportar"],
  },
  {
    modulo: "Solicitações",
    chave: "solicitacoes",
    acoes: ["visualizar", "criar", "editar", "excluir", "classificar"],
  },
  {
    modulo: "Vistorias",
    chave: "vistorias",
    acoes: ["visualizar", "criar", "editar", "excluir"],
  },
  {
    modulo: "Relatórios",
    chave: "relatorios",
    acoes: ["visualizar", "exportar"],
  },
  {
    modulo: "Configurações",
    chave: "configuracoes",
    acoes: ["visualizar", "editar"],
  },
  {
    modulo: "Auditoria",
    chave: "auditoria",
    acoes: ["visualizar"],
  },
  {
    modulo: "Logs",
    chave: "logs",
    acoes: ["visualizar"],
  },
];

const ROTULOS_ACAO = {
  visualizar: "Visualizar",
  criar: "Criar",
  editar: "Editar",
  excluir: "Excluir",
  exportar: "Exportar",
  classificar: "Classificar solicitações",
};

export default function PermissoesPage() {

  const router = useRouter();

  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [perfilId, setPerfilId] = useState("");
  const [selecionadas, setSelecionadas] = useState(new Set());

  const carregarPerfis = useCallback(async () => {

    try {

      setLoading(true);

      const resposta = await PerfilService.listar();

      const lista = Array.isArray(resposta)
        ? resposta
        : resposta.data || [];

      setPerfis(lista);

      if (lista.length > 0) {
        setPerfilId((atual) => atual || lista[0].id);
      }

    } catch (err) {

      console.error(err);

      setErro(
        err.message ||
        "Erro ao carregar perfis."
      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    carregarPerfis();

  }, [carregarPerfis]);

  useEffect(() => {

    const perfil = perfis.find((p) => p.id === perfilId);

    setSelecionadas(
      new Set(perfil?.permissoes || [])
    );

  }, [perfilId, perfis]);

  const perfilAtual = useMemo(
    () => perfis.find((p) => p.id === perfilId),
    [perfis, perfilId]
  );

  function alternar(chavePermissao) {

    setSelecionadas((atual) => {

      const nova = new Set(atual);

      if (nova.has(chavePermissao)) {
        nova.delete(chavePermissao);
      } else {
        nova.add(chavePermissao);
      }

      return nova;

    });

  }

  function alternarModuloCompleto(modulo) {

    const chaves = modulo.acoes.map(
      (acao) => `${modulo.chave}.${acao}`
    );

    const todasMarcadas = chaves.every(
      (chave) => selecionadas.has(chave)
    );

    setSelecionadas((atual) => {

      const nova = new Set(atual);

      chaves.forEach((chave) => {
        if (todasMarcadas) {
          nova.delete(chave);
        } else {
          nova.add(chave);
        }
      });

      return nova;

    });

  }

  async function salvar() {

    if (!perfilId) return;

    setSalvando(true);

    try {

      await PerfilService.atualizar(perfilId, {
        permissoes: Array.from(selecionadas),
      });

      await carregarPerfis();

      alert("Permissões salvas com sucesso.");

    } catch (err) {

      alert(
        err.message ||
        "Erro ao salvar permissões."
      );

    } finally {

      setSalvando(false);

    }

  }

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <div className="flex items-center justify-between">

              <div>

                <h1 className="text-5xl font-black text-white">
                  Permissões
                </h1>

                <p className="text-gray-400">
                  Controle de acesso por perfil
                </p>

              </div>

              <button
                onClick={() => router.back()}
                className="
                  px-5
                  py-3
                  rounded-xl
                  bg-white/10
                  hover:bg-white/20
                  text-white
                  flex
                  items-center
                  gap-2
                "
              >
                <ArrowLeft size={18} />
                Voltar
              </button>

            </div>

          </FadeIn>

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

          <PageSection spacing="lg">

            <Select
              label="Perfil"
              value={perfilId}
              onChange={(e) => setPerfilId(e.target.value)}
              options={perfis.map((perfil) => ({
                label: perfil.nome,
                value: perfil.id,
              }))}
            />

          </PageSection>

          {loading ? (

            <Card>
              <p className="text-gray-400 text-center py-10">
                Carregando...
              </p>
            </Card>

          ) : !perfilAtual ? (

            <Card>
              <p className="text-gray-400 text-center py-10">
                Nenhum perfil cadastrado ainda.
              </p>
            </Card>

          ) : (

            <PageSection spacing="xxl">

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

                {CATALOGO.map((modulo) => (

                  <Card key={modulo.chave}>

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        mb-5
                      "
                    >

                      <div className="flex items-center gap-3">

                        <KeyRound
                          size={18}
                          className="text-emerald-400"
                        />

                        <h3 className="text-lg font-bold text-white">
                          {modulo.modulo}
                        </h3>

                      </div>

                      <button
                        type="button"
                        onClick={() => alternarModuloCompleto(modulo)}
                        className="
                          text-xs
                          font-semibold
                          text-emerald-400
                          hover:text-emerald-300
                        "
                      >
                        Marcar tudo
                      </button>

                    </div>

                    <div className="space-y-3">

                      {modulo.acoes.map((acao) => {

                        const chave = `${modulo.chave}.${acao}`;

                        return (

                          <label
                            key={chave}
                            className="
                              flex
                              items-center
                              gap-3
                              text-gray-300
                              cursor-pointer
                            "
                          >

                            <input
                              type="checkbox"
                              checked={selecionadas.has(chave)}
                              onChange={() => alternar(chave)}
                            />

                            {ROTULOS_ACAO[acao] || acao}

                          </label>

                        );

                      })}

                    </div>

                  </Card>

                ))}

              </div>

              <div className="mt-8 flex justify-end">

                <Button onClick={salvar} disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar Permissões"}
                </Button>

              </div>

            </PageSection>

          )}

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
