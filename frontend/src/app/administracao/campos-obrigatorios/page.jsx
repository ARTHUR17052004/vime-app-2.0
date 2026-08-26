/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ListChecks } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

import { CamposObrigatoriosService } from "@/services/camposObrigatorios.service";

// Cada módulo lista os campos disponíveis no cadastro dele. Mais
// módulos entram aqui conforme forem sendo revisados.
const MODULOS = [
  {
    chave: "residencia",
    nome: "Residências",
    campos: [
      { campo: "cep", label: "CEP" },
      { campo: "logradouro", label: "Logradouro" },
      { campo: "numero", label: "Número" },
      { campo: "complemento", label: "Complemento" },
      { campo: "bairro", label: "Bairro" },
      { campo: "locadorId", label: "Locador" },
      { campo: "aluguel", label: "Valor do Aluguel" },
      { campo: "vencimento", label: "Dia de Vencimento" },
      { campo: "dataInicioCobranca", label: "Data de Início da Cobrança" },
      { campo: "status", label: "Status" },
      { campo: "observacoes", label: "Observações" },
    ],
  },
  {
    chave: "inquilino",
    nome: "Inquilinos",
    campos: [
      { campo: "cpf", label: "CPF" },
      { campo: "dataNascimento", label: "Data de Nascimento" },
      { campo: "enderecoAnterior", label: "Endereço Anterior" },
      { campo: "contatoEmergencia", label: "Contato de Emergência" },
      { campo: "telefoneEmergencia", label: "Telefone de Emergência" },
      { campo: "dataFimContrato", label: "Data Final do Contrato" },
      { campo: "tipoGarantia", label: "Tipo de Garantia" },
      { campo: "valorCaucao", label: "Valor da Caução" },
    ],
  },
  {
    chave: "kitnet",
    nome: "Kitnets",
    campos: [
      { campo: "nome", label: "Nome da Kitnet" },
      { campo: "status", label: "Status" },
      { campo: "observacoes", label: "Observações" },
    ],
  },
  {
    chave: "locador",
    nome: "Locadores",
    campos: [
      { campo: "email", label: "E-mail" },
      { campo: "telefone", label: "Telefone" },
      { campo: "banco", label: "Banco" },
      { campo: "agencia", label: "Agência" },
      { campo: "conta", label: "Conta" },
      { campo: "pix", label: "Chave PIX" },
      { campo: "taxaAdministracao", label: "Taxa de Administração" },
      { campo: "multa", label: "Multa" },
      { campo: "juros", label: "Juros" },
    ],
  },
  {
    chave: "contrato",
    nome: "Contratos",
    campos: [
      { campo: "dataFim", label: "Data Final do Contrato" },
      { campo: "tipoGarantia", label: "Tipo de Garantia" },
      { campo: "valorCaucao", label: "Valor da Caução" },
      { campo: "indiceReajuste", label: "Índice de Reajuste" },
    ],
  },
  {
    chave: "solicitacao",
    nome: "Solicitações",
    campos: [
      { campo: "titulo", label: "Título" },
      { campo: "descricao", label: "Descrição" },
      { campo: "prazo", label: "Prazo" },
    ],
  },
];

export default function CamposObrigatoriosPage() {

  const router = useRouter();

  const [moduloChave, setModuloChave] = useState(MODULOS[0].chave);
  const [selecionados, setSelecionados] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const moduloAtual = MODULOS.find((m) => m.chave === moduloChave);

  const carregar = useCallback(async () => {

    try {

      setLoading(true);
      setErro("");

      const resposta = await CamposObrigatoriosService.listar(moduloChave);
      const lista = Array.isArray(resposta) ? resposta : resposta.data || [];

      setSelecionados(
        new Set(lista.filter((c) => c.obrigatorio).map((c) => c.campo))
      );

    } catch (err) {

      console.error(err);
      setErro(err.message || "Erro ao carregar configuração.");

    } finally {

      setLoading(false);

    }

  }, [moduloChave]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function alternar(campo) {
    setSelecionados((atual) => {
      const nova = new Set(atual);
      if (nova.has(campo)) {
        nova.delete(campo);
      } else {
        nova.add(campo);
      }
      return nova;
    });
  }

  function marcarTudo() {
    const todosMarcados = moduloAtual.campos.every((c) =>
      selecionados.has(c.campo)
    );

    setSelecionados(
      todosMarcados
        ? new Set()
        : new Set(moduloAtual.campos.map((c) => c.campo))
    );
  }

  async function salvar() {

    setSalvando(true);

    try {

      const campos = moduloAtual.campos.map((c) => ({
        campo: c.campo,
        obrigatorio: selecionados.has(c.campo),
      }));

      await CamposObrigatoriosService.salvar(moduloChave, campos);

      alert("Campos obrigatórios salvos com sucesso.");

    } catch (err) {

      alert(err.message || "Erro ao salvar.");

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
                <h1 className="text-5xl font-black text-[var(--text)]">
                  Campos Obrigatórios
                </h1>

                <p className="text-[var(--text-subtle)]">
                  Escolha quais campos precisam ser preenchidos em cada cadastro.
                </p>
              </div>

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
              label="Cadastro"
              value={moduloChave}
              onChange={(e) => setModuloChave(e.target.value)}
              options={MODULOS.map((m) => ({
                label: m.nome,
                value: m.chave,
              }))}
            />

          </PageSection>

          <PageSection spacing="xxl">

            <Card>

              <div className="flex items-center justify-between mb-5">

                <div className="flex items-center gap-3">
                  <ListChecks size={18} className="text-emerald-400" />
                  <h3 className="text-lg font-bold text-[var(--text)]">
                    {moduloAtual.nome}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={marcarTudo}
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

              {loading ? (

                <p className="text-[var(--text-subtle)] text-center py-10">
                  Carregando...
                </p>

              ) : (

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {moduloAtual.campos.map((c) => (

                    <label
                      key={c.campo}
                      className="
                        flex
                        items-center
                        gap-3
                        text-[var(--text-muted)]
                        cursor-pointer
                      "
                    >

                      <input
                        type="checkbox"
                        checked={selecionados.has(c.campo)}
                        onChange={() => alternar(c.campo)}
                      />

                      {c.label}

                    </label>

                  ))}

                </div>

              )}

            </Card>

            <div className="mt-8 flex justify-end">
              <Button onClick={salvar} disabled={salvando || loading}>
                {salvando ? "Salvando..." : "Salvar Campos Obrigatórios"}
              </Button>
            </div>

          </PageSection>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
