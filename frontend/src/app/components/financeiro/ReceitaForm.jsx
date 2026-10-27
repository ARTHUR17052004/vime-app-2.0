"use client";

import { useEffect, useState } from "react";

import { InquilinoService } from "../../../services/inquilinos.service";
import { CamposObrigatoriosService } from "../../../services/camposObrigatorios.service";
import { ConfiguracaoFinanceiroService } from "../../../services/configuracaoFinanceiro.service";
import { obterCamposFaltando, mensagemCamposFaltando } from "../../../utils/validacaoObrigatorios";

// Categoria/Descrição/Valor são colunas obrigatórias no banco -- não
// tem como ficarem em branco independente do que for configurado.
const SEMPRE_OBRIGATORIOS = new Set(["categoria", "descricao", "valor"]);

// Calcula o valor líquido a partir do bruto e da taxa de boleto (%) --
// mesma conta que o backend faz sozinho quando valorLiquido não vem
// preenchido; replicado aqui só pra já mostrar a sugestão em tempo
// real, sem esperar o salvar.
function calcularValorLiquido(valor, taxaPercentual) {
  const numero = Number(String(valor).replace(",", "."));
  if (Number.isNaN(numero)) return "";
  return (Math.round(numero * (1 - taxaPercentual / 100) * 100) / 100).toString();
}

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
      valorLiquido: "",
      recorrente: false,
    });

  const [inquilinos, setInquilinos] = useState([]);

  const [taxaBoleto, setTaxaBoleto] = useState(0);

  // Só true se o usuário mexeu manualmente no campo "Valor a receber"
  // -- enquanto isso não acontece, ele acompanha sozinho o cálculo
  // automático toda vez que o "Valor" muda.
  const [valorLiquidoEditadoManualmente, setValorLiquidoEditadoManualmente] = useState(false);

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

    async function carregarTaxaBoleto() {

      try {

        const resposta = await ConfiguracaoFinanceiroService.buscar();
        const dados = resposta.data || resposta;

        setTaxaBoleto(dados.taxaBoletoPercentual || 0);

      } catch (err) {

        console.error("Erro ao carregar taxa de boleto:", err);

      }

    }

    carregarInquilinos();
    carregarObrigatorios();
    carregarTaxaBoleto();

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
        valorLiquido: receitaEditando.valorLiquido ?? "",
        recorrente: receitaEditando.recorrente || false,
      });
      // Já tem valor líquido salvo -- editar o Valor não deve
      // recalcular por cima sem avisar, então trata como "manual".
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValorLiquidoEditadoManualmente(true);
    }
  }, [receitaEditando]);

  // Acompanha o Valor sozinho até o usuário mexer direto no Valor a
  // Receber -- mesmo cálculo que o backend faz quando não vem
  // preenchido, só que aqui já mostra em tempo real.
  useEffect(() => {
    if (valorLiquidoEditadoManualmente) return;
    if (formData.valor === "") return;

    setFormData((atual) => ({
      ...atual,
      valorLiquido: calcularValorLiquido(formData.valor, taxaBoleto),
    }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.valor, taxaBoleto]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleChangeValorLiquido = (e) => {
    setValorLiquidoEditadoManualmente(true);
    setFormData({ ...formData, valorLiquido: e.target.value });
  };

  const handleChangeRecorrente = (e) => {
    setFormData({ ...formData, recorrente: e.target.checked });
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
      // "" (nunca mexeu) manda undefined de propósito -- deixa o
      // backend calcular sozinho pela taxa configurada, em vez de
      // mandar null e achar que foi um "zerar" deliberado.
      valorLiquido: formData.valorLiquido === "" ? undefined : formData.valorLiquido,
      recorrente: formData.recorrente,
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
            Valor cobrado<span className="ml-1 text-red-400">*</span>
          </label>
          <input
            name="valor"
            placeholder="Valor"
            value={formData.valor}
            onChange={handleChange}
            className={inputStyle}
            required
          />
          <p className="text-[10px] text-[var(--text-faint)] mt-1">
            O que o pagador vai pagar no boleto.
          </p>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Valor a receber
          </label>
          <input
            name="valorLiquido"
            placeholder="Valor a receber"
            value={formData.valorLiquido}
            onChange={handleChangeValorLiquido}
            className={inputStyle}
          />
          <p className="text-[10px] text-[var(--text-faint)] mt-1">
            {taxaBoleto > 0
              ? `Calculado sozinho com a taxa de boleto configurada (${taxaBoleto}%) -- edite se essa cobrança tiver uma taxa diferente.`
              : "Sem taxa de boleto configurada ainda -- some igual ao valor cobrado."}
          </p>
        </div>

        <div className="md:col-span-2 flex items-center gap-2.5 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4">
          <input
            type="checkbox"
            id="recorrente"
            checked={formData.recorrente}
            onChange={handleChangeRecorrente}
            className="w-4 h-4 accent-emerald-500"
          />
          <label htmlFor="recorrente" className="text-sm text-[var(--text)] cursor-pointer">
            Repetir essa cobrança todo mês (gera a próxima automaticamente assim que esta for paga)
          </label>
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