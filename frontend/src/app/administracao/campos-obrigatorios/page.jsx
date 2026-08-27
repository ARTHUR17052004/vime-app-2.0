/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ListChecks, Lock } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";
import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

import { CamposObrigatoriosService } from "@/services/camposObrigatorios.service";

// Cada módulo lista os campos disponíveis no cadastro dele. Campos com
// `travado: true` são exigidos pelo próprio sistema (coluna obrigatória
// no banco) e nunca podem virar opcionais -- aparecem marcados e
// desabilitados só pra deixar claro que existem e por que não dá pra
// desmarcar, mas não são salvos como configuração (quem trava esses
// campos é o código, não esta tela).
const MODULOS = [
  {
    chave: "residencia",
    nome: "Residências",
    campos: [
      { campo: "nome", label: "Nome da Residência", travado: true },
      { campo: "cep", label: "CEP" },
      { campo: "logradouro", label: "Logradouro" },
      { campo: "numero", label: "Número" },
      { campo: "complemento", label: "Complemento" },
      { campo: "bairro", label: "Bairro" },
      { campo: "cidade", label: "Cidade", travado: true },
      { campo: "uf", label: "UF", travado: true },
      { campo: "locadorId", label: "Locador" },
      { campo: "kitnets", label: "Quantidade de Kitnets", travado: true },
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
      { campo: "nome", label: "Nome Completo", travado: true },
      { campo: "email", label: "E-mail", travado: true },
      { campo: "telefone", label: "Telefone", travado: true },
      { campo: "cpf", label: "CPF" },
      { campo: "dataNascimento", label: "Data de Nascimento" },
      { campo: "enderecoAnterior", label: "Endereço Anterior" },
      { campo: "contatoEmergencia", label: "Contato de Emergência" },
      { campo: "telefoneEmergencia", label: "Telefone de Emergência" },
      { campo: "kitnetId", label: "Kitnet", travado: true },
      { campo: "dataInicioContrato", label: "Início do Contrato", travado: true },
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
      { campo: "unidadeId", label: "Residência", travado: true },
      { campo: "numero", label: "Número", travado: true },
      { campo: "metragem", label: "Metragem", travado: true },
      { campo: "aluguel", label: "Valor do Aluguel", travado: true },
      { campo: "status", label: "Status" },
      { campo: "observacoes", label: "Observações" },
    ],
  },
  {
    chave: "locador",
    nome: "Locadores",
    campos: [
      { campo: "nome", label: "Nome Completo", travado: true },
      { campo: "documento", label: "CPF/CNPJ", travado: true },
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
      { campo: "locadorId", label: "Locador", travado: true },
      { campo: "unidadeId", label: "Residência", travado: true },
      { campo: "kitnetId", label: "Kitnet", travado: true },
      { campo: "inquilinoId", label: "Inquilino", travado: true },
      { campo: "dataInicio", label: "Data de Criação do Contrato", travado: true },
      { campo: "valorAluguel", label: "Valor do Aluguel", travado: true },
      { campo: "diaVencimento", label: "Dia do Vencimento", travado: true },
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
      { campo: "numero", label: "Número", travado: true },
      { campo: "titulo", label: "Título" },
      { campo: "descricao", label: "Descrição" },
      { campo: "prazo", label: "Prazo" },
    ],
  },
  {
    chave: "vistoria",
    nome: "Vistorias",
    campos: [
      { campo: "titulo", label: "Nome da Vistoria", travado: true },
      { campo: "unidadeId", label: "Residência" },
      { campo: "kitnetId", label: "Kitnet" },
      { campo: "categoria", label: "Categoria" },
      { campo: "criticidade", label: "Criticidade" },
      { campo: "periodicidade", label: "Periodicidade" },
      { campo: "responsavel", label: "Responsável" },
      { campo: "dataProxima", label: "Data Próxima" },
      { campo: "observacoes", label: "Observações" },
    ],
  },
  {
    chave: "receita",
    nome: "Financeiro — Receitas",
    campos: [
      { campo: "categoria", label: "Categoria", travado: true },
      { campo: "descricao", label: "Descrição", travado: true },
      { campo: "valor", label: "Valor", travado: true },
      { campo: "inquilinoId", label: "Inquilino" },
      { campo: "status", label: "Status" },
      { campo: "vencimento", label: "Vencimento" },
      { campo: "dataPagamento", label: "Data de Pagamento" },
    ],
  },
  {
    chave: "despesa",
    nome: "Financeiro — Despesas",
    campos: [
      { campo: "categoria", label: "Categoria", travado: true },
      { campo: "descricao", label: "Descrição", travado: true },
      { campo: "valor", label: "Valor", travado: true },
      { campo: "unidadeId", label: "Residência" },
      { campo: "status", label: "Status" },
      { campo: "vencimento", label: "Vencimento" },
      { campo: "dataPagamento", label: "Data de Pagamento" },
    ],
  },
  {
    chave: "cobranca",
    nome: "Financeiro — Nova Cobrança",
    campos: [
      { campo: "categoria", label: "Categoria", travado: true },
      { campo: "descricao", label: "Descrição", travado: true },
      { campo: "valor", label: "Valor", travado: true },
      { campo: "contratoId", label: "Contrato (Inquilino)" },
      { campo: "vencimento", label: "Vencimento" },
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

    const configuraveis = moduloAtual.campos.filter((c) => !c.travado);

    const todosMarcados = configuraveis.every((c) =>
      selecionados.has(c.campo)
    );

    setSelecionados(
      todosMarcados
        ? new Set()
        : new Set(configuraveis.map((c) => c.campo))
    );
  }

  async function salvar() {

    setSalvando(true);

    try {

      const campos = moduloAtual.campos
        .filter((c) => !c.travado)
        .map((c) => ({
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
                      className={`
                        flex
                        items-start
                        gap-3
                        ${c.travado
                          ? "text-[var(--text-faint)] cursor-not-allowed"
                          : "text-[var(--text-muted)] cursor-pointer"}
                      `}
                    >

                      <input
                        type="checkbox"
                        checked={c.travado ? true : selecionados.has(c.campo)}
                        disabled={c.travado}
                        onChange={() => alternar(c.campo)}
                        className="mt-0.5"
                      />

                      <span>

                        {c.label}

                        {c.travado && (
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-[var(--text-faint)]">
                            <Lock size={10} />
                            sempre obrigatório
                          </span>
                        )}

                      </span>

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
