"use client";

import { useEffect, useState } from "react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";

import { ContaPagamentoService } from "../../../services/contaPagamento.service";
import { usePermissao } from "../../../hooks/usePermissao";

import { Landmark, Plus, Pencil, Trash2, Star } from "lucide-react";

// Cada provedor pede campos bem diferentes -- ver ContaPagamento.credenciais
// no backend. Adicionar um banco novo é só acrescentar uma entrada aqui.
const CAMPOS_POR_PROVIDER = {
  ASAAS: [
    { campo: "apiKey", rotulo: "API Key", obrigatorio: true },
    { campo: "walletId", rotulo: "Wallet ID (opcional)" },
  ],
  BB: [
    { campo: "clientId", rotulo: "Client ID", obrigatorio: true },
    { campo: "clientSecret", rotulo: "Client Secret", obrigatorio: true },
    { campo: "appKey", rotulo: "Application Key (gw-dev-app-key)", obrigatorio: true },
    { campo: "ambiente", rotulo: "Ambiente (homologacao ou producao)", obrigatorio: true },
    { campo: "numeroConvenio", rotulo: "Número do Convênio", obrigatorio: true },
    { campo: "numeroCarteira", rotulo: "Número da Carteira", obrigatorio: true },
    { campo: "numeroVariacaoCarteira", rotulo: "Variação da Carteira", obrigatorio: true },
    { campo: "agencia", rotulo: "Agência", obrigatorio: true },
    { campo: "conta", rotulo: "Conta", obrigatorio: true },
  ],
};

const NOME_PROVIDER = {
  ASAAS: "Asaas",
  BB: "Banco do Brasil",
};

const FORM_INICIAL = {
  id: null,
  provider: "ASAAS",
  nome: "",
  padrao: false,
  ativo: true,
  credenciais: {},
};

export default function ContasCard() {

  const podeEditar = usePermissao("asaasConfig.editar");

  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
      setLoading(true);
      const resposta = await ContaPagamentoService.listar();
      setContas(resposta.data || []);
    } catch (err) {
      console.error("Erro ao carregar contas:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNova() {
    setForm(FORM_INICIAL);
    setErro("");
    setModalOpen(true);
  }

  function abrirEdicao(conta) {
    setForm({
      id: conta.id,
      provider: conta.provider,
      nome: conta.nome,
      padrao: conta.padrao,
      ativo: conta.ativo,
      credenciais: conta.credenciais || {},
    });
    setErro("");
    setModalOpen(true);
  }

  function alterarCampoCredencial(campo, valor) {
    setForm((atual) => ({
      ...atual,
      credenciais: { ...atual.credenciais, [campo]: valor },
    }));
  }

  async function salvar(e) {
    e.preventDefault();

    if (!form.nome.trim()) {
      setErro("Dê um nome pra essa conta (ex: \"BB - Locador SH\").");
      return;
    }

    const campos = CAMPOS_POR_PROVIDER[form.provider];
    const faltando = campos.filter(
      (c) => c.obrigatorio && !String(form.credenciais[c.campo] || "").trim()
    );

    if (faltando.length > 0) {
      setErro(`Preencha: ${faltando.map((c) => c.rotulo).join(", ")}.`);
      return;
    }

    setErro("");
    setSalvando(true);

    try {

      const payload = {
        provider: form.provider,
        nome: form.nome,
        padrao: form.padrao,
        ativo: form.ativo,
        credenciais: form.credenciais,
      };

      if (form.id) {
        await ContaPagamentoService.atualizar(form.id, payload);
      } else {
        await ContaPagamentoService.criar(payload);
      }

      setModalOpen(false);
      await carregar();

    } catch (err) {
      setErro(err.message || "Erro ao salvar a conta.");
    } finally {
      setSalvando(false);
    }

  }

  async function excluir(conta) {
    if (!confirm(`Excluir a conta "${conta.nome}"? Locadores vinculados a ela precisam ser trocados antes.`)) return;

    try {
      await ContaPagamentoService.excluir(conta.id);
      await carregar();
    } catch (err) {
      alert(err.message || "Erro ao excluir a conta.");
    }
  }

  const inputStyle =
    "border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-600";

  return (
    <div className="bg-[var(--surface)] backdrop-blur-[24px] rounded-2xl border border-[var(--border-token)] overflow-hidden">

      <div className="px-6 py-5 border-b border-[var(--border-token)] flex items-center justify-between flex-wrap gap-3">

        <div>
          <h2 className="text-xl font-bold text-[var(--text)] flex items-center gap-2">
            <Landmark size={20} />
            Contas
          </h2>
          <p className="text-sm text-[var(--text-subtle)] mt-1">
            Cada conta é um banco (Asaas, Banco do Brasil...) que pode receber cobranças. Vincule cada locador à conta certa mais abaixo.
          </p>
        </div>

        {podeEditar && (
          <Button onClick={abrirNova} leftIcon={<Plus size={18} />}>
            Adicionar Conta
          </Button>
        )}

      </div>

      <div className="p-6 grid md:grid-cols-2 gap-4">

        {loading && (
          <p className="text-[var(--text-subtle)] col-span-2 text-center py-6">Carregando contas...</p>
        )}

        {!loading && contas.length === 0 && (
          <p className="text-[var(--text-subtle)] col-span-2 text-center py-6">
            Nenhuma conta cadastrada ainda. Clique em "Adicionar Conta".
          </p>
        )}

        {contas.map((conta) => (
          <div
            key={conta.id}
            className="rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] p-5"
          >

            <div className="flex items-start justify-between gap-3">

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {NOME_PROVIDER[conta.provider] || conta.provider}
                  </span>

                  {conta.padrao && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 flex items-center gap-1">
                      <Star size={12} /> Padrão do sistema
                    </span>
                  )}

                  {!conta.ativo && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                      Inativa
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[var(--text)] mt-2">
                  {conta.nome}
                </h3>

                <p className="text-sm text-[var(--text-subtle)] mt-1">
                  {conta.locadores?.length > 0
                    ? `Usada por: ${conta.locadores.map((l) => l.nome).join(", ")}`
                    : "Nenhum locador vinculado diretamente (só entra se for a padrão)."}
                </p>
              </div>

              {podeEditar && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => abrirEdicao(conta)}
                    className="p-2 rounded-lg border border-[var(--border-token)] text-[var(--text-1)] hover:bg-[var(--surface-3)]"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => excluir(conta)}
                    className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

            </div>

          </div>
        ))}

      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? "Editar Conta" : "Adicionar Conta"}
        subtitle="As credenciais ficam guardadas só no servidor, nunca aparecem pra quem não tem permissão de editar contas."
        size="md"
      >

        <form onSubmit={salvar} className="space-y-5">

          {erro && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-sm">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[var(--text-1)] mb-2">
              Banco
            </label>
            <select
              value={form.provider}
              disabled={!!form.id}
              onChange={(e) => setForm((a) => ({ ...a, provider: e.target.value, credenciais: {} }))}
              className={`${inputStyle} disabled:opacity-60`}
            >
              <option value="ASAAS" className="bg-[#1b2430]">Asaas</option>
              <option value="BB" className="bg-[#1b2430]">Banco do Brasil</option>
            </select>
            {form.id && (
              <p className="text-xs text-[var(--text-faint)] mt-1">
                Não dá pra trocar o banco de uma conta já criada -- crie uma nova.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--text-1)] mb-2">
              Nome da conta<span className="text-red-400"> *</span>
            </label>
            <input
              value={form.nome}
              onChange={(e) => setForm((a) => ({ ...a, nome: e.target.value }))}
              placeholder='Ex: "BB - Locador SH"'
              className={inputStyle}
            />
          </div>

          <div className="border-t border-[var(--border-token)] pt-5 space-y-4">
            {CAMPOS_POR_PROVIDER[form.provider].map((c) => (
              <div key={c.campo}>
                <label className="block text-sm font-semibold text-[var(--text-1)] mb-2">
                  {c.rotulo}{c.obrigatorio && <span className="text-red-400"> *</span>}
                </label>
                <input
                  value={form.credenciais[c.campo] || ""}
                  onChange={(e) => alterarCampoCredencial(c.campo, e.target.value)}
                  className={inputStyle}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 border-t border-[var(--border-token)] pt-5">

            <label className="flex items-center gap-2 text-sm text-[var(--text-1)]">
              <input
                type="checkbox"
                checked={form.padrao}
                onChange={(e) => setForm((a) => ({ ...a, padrao: e.target.checked }))}
              />
              Usar como conta padrão do sistema
            </label>

            {form.id && (
              <label className="flex items-center gap-2 text-sm text-[var(--text-1)]">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => setForm((a) => ({ ...a, ativo: e.target.checked }))}
                />
                Ativa
              </label>
            )}

          </div>

          <p className="text-xs text-[var(--text-faint)]">
            Marcar como padrão faz essa conta receber as cobranças de qualquer locador que não tenha uma conta própria vinculada.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="border border-[var(--border-token)] text-[var(--text-1)] rounded-xl px-5 py-3 hover:bg-[var(--surface-2)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-[var(--text)] rounded-xl px-5 py-3"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>

        </form>

      </Modal>

    </div>
  );
}
