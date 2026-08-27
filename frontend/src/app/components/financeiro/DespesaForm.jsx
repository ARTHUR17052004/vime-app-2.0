"use client";

import { useEffect, useState } from "react";

import { UnidadeService } from "@/services/unidades.service";
import { CamposObrigatoriosService } from "@/services/camposObrigatorios.service";
import { obterCamposFaltando, mensagemCamposFaltando } from "@/utils/validacaoObrigatorios";

// Categoria/Descrição/Valor são colunas obrigatórias no banco -- não
// tem como ficarem em branco independente do que for configurado.
const SEMPRE_OBRIGATORIOS = new Set(["categoria", "descricao", "valor"]);

const CAMPOS = ["categoria", "descricao", "valor", "unidadeId", "status", "vencimento", "dataPagamento"];

const ROTULOS = {
  categoria: "Categoria",
  descricao: "Descrição",
  valor: "Valor",
  unidadeId: "Residência",
  status: "Status",
  vencimento: "Vencimento",
  dataPagamento: "Data de Pagamento",
};

export default function DespesaForm({
  onSave,
  despesaEditando,
}) {
  const [residencias, setResidencias] = useState([]);

  const [obrigatorios, setObrigatorios] = useState(new Set());
  const [erro, setErro] = useState("");

  const [formData, setFormData] =
    useState({
      categoria:
        "Manutenção e Reparos",

      descricao: "",

      valor: "",

      status: "PAGO",

      vencimento: "",

      dataPagamento: "",

      unidadeId: "",
    });

  useEffect(() => {
    async function carregarResidencias() {
      try {
        const resposta = await UnidadeService.listar();
        setResidencias(
          Array.isArray(resposta) ? resposta : resposta.data || []
        );
      } catch (err) {
        console.error("Erro ao carregar residências:", err);
      }
    }

    async function carregarObrigatorios() {

      try {

        const resposta = await CamposObrigatoriosService.listar("despesa");
        const lista = Array.isArray(resposta) ? resposta : resposta.data || [];

        setObrigatorios(
          new Set(lista.filter((c) => c.obrigatorio).map((c) => c.campo))
        );

      } catch (err) {

        console.error(err);

      }

    }

    carregarResidencias();
    carregarObrigatorios();
  }, []);

  useEffect(() => {
    if (despesaEditando) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        unidadeId: "",
        ...despesaEditando,
      });
    }
  }, [despesaEditando]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const exigidos = new Set([...obrigatorios, ...SEMPRE_OBRIGATORIOS]);

    const faltando = obterCamposFaltando(CAMPOS, formData, exigidos, ROTULOS);

    if (faltando.length > 0) {
      setErro(mensagemCamposFaltando(faltando));
      return;
    }

    setErro("");

    onSave(formData);
  };

  const inputStyle =
    "border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-[var(--text)]">
        {despesaEditando
          ? "Editar Despesa"
          : "Nova Despesa"}
      </h2>

      <div className="grid md:grid-cols-2 gap-5">

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Categoria<span className="ml-1 text-red-400">*</span>
          </label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
            className={inputStyle}
          >
            <option>Manutenção e Reparos</option>
            <option>Impostos e Taxas</option>
            <option>Seguros</option>
            <option>Pessoal</option>
            <option>Condomínio</option>
            <option>Administrativo</option>
            <option>Marketing</option>
            <option>Reformas</option>
            <option>Financeiras</option>
            <option>Depreciação</option>
            <option>Devolução de Caução</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Descrição<span className="ml-1 text-red-400">*</span>
          </label>
          <input
            name="descricao"
            placeholder="Descrição"
            value={formData.descricao}
            onChange={handleChange}
            className={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Valor<span className="ml-1 text-red-400">*</span>
          </label>
          <input
            name="valor"
            placeholder="Valor"
            value={formData.valor}
            onChange={handleChange}
            className={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Status{obrigatorios.has("status") && <span className="text-red-400"> *</span>}
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required={obrigatorios.has("status")}
            className={inputStyle}
          >
            <option value="PAGO">Pago</option>
            <option value="PENDENTE">Pendente</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Residência{obrigatorios.has("unidadeId") && <span className="text-red-400"> *</span>}
          </label>
          <select
            name="unidadeId"
            value={formData.unidadeId || ""}
            onChange={handleChange}
            required={obrigatorios.has("unidadeId")}
            className={inputStyle}
          >
            <option value="">Selecione (opcional)</option>
            {residencias.map((residencia) => (
              <option key={residencia.id} value={residencia.id}>
                {residencia.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Vencimento{obrigatorios.has("vencimento") && <span className="text-red-400"> *</span>}
          </label>
          <input
            type="date"
            name="vencimento"
            value={formData.vencimento}
            onChange={handleChange}
            required={obrigatorios.has("vencimento")}
            className={`${inputStyle} w-full`}
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Data de Pagamento{obrigatorios.has("dataPagamento") && <span className="text-red-400"> *</span>}
          </label>
          <input
            type="date"
            name="dataPagamento"
            required={obrigatorios.has("dataPagamento")}
            value={formData.dataPagamento}
            onChange={handleChange}
            className={`${inputStyle} w-full`}
          />
        </div>

      </div>

      {erro && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
          {erro}
        </div>
      )}

      <div className="flex justify-end">
        <button
          className="
            bg-green-700
            text-[var(--text)]
            px-6
            py-3
            rounded-xl
          "
        >
          Salvar
        </button>
      </div>

    </form>
  );
}