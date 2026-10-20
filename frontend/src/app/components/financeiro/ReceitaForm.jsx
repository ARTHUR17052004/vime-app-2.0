"use client";

import { useEffect, useState } from "react";

import { InquilinoService } from "../../../services/inquilinos.service";
import { CamposObrigatoriosService } from "../../../services/camposObrigatorios.service";
import { obterCamposFaltando, mensagemCamposFaltando } from "../../../utils/validacaoObrigatorios";

// Categoria/Descrição/Valor são colunas obrigatórias no banco -- não
// tem como ficarem em branco independente do que for configurado.
const SEMPRE_OBRIGATORIOS = new Set(["categoria", "descricao", "valor"]);

const CAMPOS = ["categoria", "descricao", "valor", "inquilinoId", "status", "vencimento", "dataPagamento"];

const ROTULOS = {
  categoria: "Categoria",
  descricao: "Descrição",
  valor: "Valor",
  inquilinoId: "Inquilino",
  status: "Status",
  vencimento: "Vencimento",
  dataPagamento: "Data de Pagamento",
};

export default function ReceitaForm({
  onSave,
  receitaEditando,
}) {
  const [formData, setFormData] =
    useState({
      categoria: "Aluguel",
      descricao: "",
      valor: "",
      status: "PENDENTE",
      vencimento: "",
      dataPagamento: "",
      inquilinoId: "",
      pagadorNome: "",
      pagadorCpf: "",
      pagadorEmail: "",
      pagadorTelefone: "",
    });

  const [inquilinos, setInquilinos] = useState([]);

  const [obrigatorios, setObrigatorios] = useState(new Set());
  const [erro, setErro] = useState("");

  useEffect(() => {

    async function carregarInquilinos() {

      try {

        const resposta = await InquilinoService.listar();

        const lista = Array.isArray(resposta) ? resposta : resposta.data || [];

        setInquilinos(lista);

      } catch (err) {

        console.error("Erro ao carregar inquilinos:", err);

      }

    }

    async function carregarObrigatorios() {

      try {

        const resposta = await CamposObrigatoriosService.listar("receita");
        const lista = Array.isArray(resposta) ? resposta : resposta.data || [];

        setObrigatorios(
          new Set(lista.filter((c) => c.obrigatorio).map((c) => c.campo))
        );

      } catch (err) {

        console.error(err);

      }

    }

    carregarInquilinos();
    carregarObrigatorios();

  }, []);

  useEffect(() => {
    if (receitaEditando) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        ...receitaEditando,
        inquilinoId: receitaEditando.inquilinoId || "",
        pagadorNome: receitaEditando.pagadorNome || "",
        pagadorCpf: receitaEditando.pagadorCpf || "",
        pagadorEmail: receitaEditando.pagadorEmail || "",
        pagadorTelefone: receitaEditando.pagadorTelefone || "",
      });
    }
  }, [receitaEditando]);

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

    onSave({
      id: formData.id,
      categoria: formData.categoria,
      descricao: formData.descricao,
      valor: formData.valor,
      status: formData.status,
      vencimento: formData.vencimento,
      dataPagamento: formData.dataPagamento,
      inquilinoId: formData.inquilinoId || null,
      contratoId: formData.contratoId || undefined,
      // Pagador avulso: só importa quando não tem inquilino escolhido
      // (é a alternativa pra gerar boleto sem cadastrar ninguém).
      pagadorNome: formData.inquilinoId ? null : (formData.pagadorNome || null),
      pagadorCpf: formData.inquilinoId ? null : (formData.pagadorCpf || null),
      pagadorEmail: formData.inquilinoId ? null : (formData.pagadorEmail || null),
      pagadorTelefone: formData.inquilinoId ? null : (formData.pagadorTelefone || null),
    });
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
        {receitaEditando
          ? "Editar Receita"
          : "Nova Receita"}
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
            <option>Aluguel</option>
            <option>Multa</option>
            <option>Taxa</option>
            <option>Outros</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Inquilino{obrigatorios.has("inquilinoId") && <span className="text-red-400"> *</span>}
          </label>
          <select
            name="inquilinoId"
            value={formData.inquilinoId}
            onChange={handleChange}
            required={obrigatorios.has("inquilinoId")}
            className={inputStyle}
          >
            <option value="">Nenhum (preencha o pagador avulso abaixo, se for enviar ao banco)</option>
            {inquilinos.map((inq) => (
              <option key={inq.id} value={inq.id}>
                {inq.nome}
              </option>
            ))}
          </select>
        </div>

        {!formData.inquilinoId && (

          <div className="md:col-span-2 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4 space-y-4">

            <p className="text-xs text-[var(--text-faint)]">
              Pagador avulso -- preencha só se for enviar essa receita ao banco (BB/Asaas)
              sem vincular a um inquilino cadastrado. Sem contrato nem inquilino, nome e CPF
              são o mínimo que o banco exige pra emitir o boleto.
            </p>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className="block text-xs text-[var(--text-faint)] mb-1.5">
                  Nome do Pagador
                </label>
                <input
                  name="pagadorNome"
                  placeholder="Nome completo"
                  value={formData.pagadorNome}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--text-faint)] mb-1.5">
                  CPF do Pagador
                </label>
                <input
                  name="pagadorCpf"
                  placeholder="000.000.000-00"
                  value={formData.pagadorCpf}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--text-faint)] mb-1.5">
                  E-mail do Pagador (opcional)
                </label>
                <input
                  name="pagadorEmail"
                  placeholder="email@exemplo.com"
                  value={formData.pagadorEmail}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--text-faint)] mb-1.5">
                  Telefone do Pagador (opcional)
                </label>
                <input
                  name="pagadorTelefone"
                  placeholder="(00) 00000-0000"
                  value={formData.pagadorTelefone}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>

            </div>

          </div>

        )}

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
            <option value="PENDENTE">Pendente</option>
            <option value="PAGA">Pago</option>
            <option value="ATRASADA">Atrasado</option>
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
            value={formData.dataPagamento}
            onChange={handleChange}
            required={obrigatorios.has("dataPagamento")}
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