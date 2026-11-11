"use client";

import { useEffect, useState } from "react";

import { InquilinoService } from "../../../services/inquilinos.service";
import SelectBusca from "../common/SelectBusca";
import { CamposObrigatoriosService } from "../../../services/camposObrigatorios.service";
import { ReceitaService } from "../../../services/financeiro.service";
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
    });

  const [inquilinos, setInquilinos] = useState([]);

  // Conta/taxa que vai valer pra essa receita -- resolvida pelo
  // backend (locador do inquilino -> conta dele, ou a conta padrão do
  // sistema). Só pra exibir; Valor a Receber e Taxa Cobrada são
  // sempre campos calculados, nunca editáveis aqui.
  const [contaInfo, setContaInfo] = useState({ contaNome: null, taxaBoletoValor: 0 });

  const [obrigatorios, setObrigatorios] = useState(new Set());
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Editar uma receita já lançada é sensível -- pedido explícito de
  // travar isso com motivo + a própria senha de quem está editando
  // (ver exigirConfirmacaoEdicaoValor no backend). Aparece em QUALQUER
  // edição (nunca na criação).
  const [confirmandoValor, setConfirmandoValor] = useState(false);
  const [motivoEdicaoValor, setMotivoEdicaoValor] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [erroConfirmacaoValor, setErroConfirmacaoValor] = useState("");
  const [payloadPendente, setPayloadPendente] = useState(null);

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
      });
    }
  }, [receitaEditando]);

  // A conta (e a taxa dela) depende de quem vai pagar -- refaz a
  // consulta toda vez que o inquilino muda, pra sempre mostrar o par
  // certo valor/taxa antes mesmo de salvar.
  useEffect(() => {

    let cancelado = false;

    ReceitaService.taxaBoleto({ inquilinoId: formData.inquilinoId || undefined })
      .then((resposta) => {
        if (cancelado) return;
        const dados = resposta.data || resposta;
        setContaInfo({
          contaNome: dados.contaNome || null,
          taxaBoletoValor: dados.taxaBoletoValor || 0,
        });
      })
      .catch((err) => console.error("Erro ao buscar taxa de boleto:", err));

    return () => {
      cancelado = true;
    };

  }, [formData.inquilinoId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // Inquilino já tem o valor do aluguel cadastrado na kitnet -- puxa
  // sozinho pra Valor e monta a Descrição no mesmo padrão já usado na
  // recorrência automática (cobrancaRecorrenteService). Continua
  // editável depois, é só um ponto de partida.
  const handleChangeInquilino = (inquilinoId) => {

    const inquilino = inquilinos.find((i) => i.id === inquilinoId);

    setFormData((atual) => {

      const atualizado = { ...atual, inquilinoId };

      if (inquilino && atual.categoria === "Aluguel") {

        const agora = new Date();

        if (inquilino.kitnet?.aluguel != null) {
          atualizado.valor = String(inquilino.kitnet.aluguel);
        }

        atualizado.descricao = `Aluguel - ${agora.getMonth() + 1}/${agora.getFullYear()}`;

      }

      return atualizado;

    });

  };

  const numeroValor = Number(String(formData.valor).replace(",", "."));
  const valorValido = formData.valor !== "" && !Number.isNaN(numeroValor);

  const valorLiquidoCalculado = valorValido
    ? Math.max(0, Math.round((numeroValor - contaInfo.taxaBoletoValor) * 100) / 100)
    : null;

  const taxaCobradaCalculada = valorValido && valorLiquidoCalculado !== null
    ? Math.round((numeroValor - valorLiquidoCalculado) * 100) / 100
    : null;

  const montarPayload = () => ({
    id: formData.id,
    categoria: formData.categoria,
    descricao: formData.descricao,
    valor: formData.valor,
    status: formData.status,
    vencimento: formData.vencimento,
    dataPagamento: formData.dataPagamento,
    inquilinoId: formData.inquilinoId || null,
    contratoId: formData.contratoId || undefined,
    // valorLiquido não vai no payload -- é sempre calculado pelo
    // backend a partir da conta de pagamento, nunca editável aqui.
    // Recorrência também não -- vira uma ação na própria linha da
    // receita, depois de criada (igual Enviar ao Banco).
  });

  const executarSave = async (payload) => {

    setErro("");
    setSalvando(true);

    try {

      await onSave(payload);

    } finally {

      setSalvando(false);

    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trava clique duplo no "Salvar" -- sem isso, dois cliques rápidos
    // (ou uma rede lenta) mandavam duas receitas idênticas antes do
    // modal fechar.
    if (salvando) return;

    const exigidos = new Set([...obrigatorios, ...SEMPRE_OBRIGATORIOS]);

    const faltando = obterCamposFaltando(CAMPOS, formData, exigidos, ROTULOS);

    if (faltando.length > 0) {
      setErro(mensagemCamposFaltando(faltando));
      return;
    }

    setErro("");

    const payload = montarPayload();

    // Pede motivo + senha em QUALQUER edição (pedido explícito, não só
    // quando o valor muda) -- criar uma receita nova continua sem essa
    // trava.
    if (receitaEditando) {
      setPayloadPendente(payload);
      setMotivoEdicaoValor("");
      setSenhaConfirmacao("");
      setErroConfirmacaoValor("");
      setConfirmandoValor(true);
      return;
    }

    await executarSave(payload);

  };

  const confirmarEdicaoValor = async (e) => {

    e.preventDefault();

    if (!motivoEdicaoValor.trim()) {
      setErroConfirmacaoValor("Digite o motivo da edição.");
      return;
    }

    if (!senhaConfirmacao) {
      setErroConfirmacaoValor("Digite sua senha pra confirmar.");
      return;
    }

    setErroConfirmacaoValor("");

    try {

      await executarSave({
        ...payloadPendente,
        motivoEdicaoValor,
        senhaConfirmacao,
      });

      setConfirmandoValor(false);
      setPayloadPendente(null);
      setSenhaConfirmacao("");

    } catch (err) {

      // Mantém o modal aberto -- senha errada ou motivo inválido é pra
      // corrigir e tentar de novo, sem perder os dados do formulário.
      setErroConfirmacaoValor(err.message || "Não foi possível confirmar a edição do valor.");

    }

  };

  const inputStyle =
    "border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full";

  const inputCalculadoStyle =
    "border border-[var(--border-token)] bg-[var(--surface-3)] text-[var(--text-muted)] rounded-xl p-3 w-full cursor-not-allowed";

  return (
    <>
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
          <SelectBusca
            value={formData.inquilinoId}
            onChange={handleChangeInquilino}
            options={inquilinos.map((inq) => ({ id: inq.id, label: inq.nome }))}
            placeholder="Digite pra buscar um inquilino..."
            required={obrigatorios.has("inquilinoId")}
          />
          <p className="text-[10px] text-[var(--text-faint)] mt-1">
            Cobrança avulsa, sem inquilino cadastrado? Use Transações &gt; Nova Cobrança.
          </p>
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
            disabled
            value={valorLiquidoCalculado !== null ? valorLiquidoCalculado : ""}
            placeholder="--"
            className={inputCalculadoStyle}
          />
          <p className="text-[10px] text-[var(--text-faint)] mt-1">
            Calculado sozinho -- não editável aqui.
          </p>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Taxa cobrada
          </label>
          <input
            disabled
            value={taxaCobradaCalculada !== null ? taxaCobradaCalculada : ""}
            placeholder="--"
            className={inputCalculadoStyle}
          />
          <p className="text-[10px] text-[var(--text-faint)] mt-1">
            {contaInfo.contaNome
              ? `Conta "${contaInfo.contaNome}" -- R$ ${contaInfo.taxaBoletoValor} de taxa de boleto.`
              : "Nenhuma conta de pagamento cadastrada ainda."}
          </p>
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

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Conta do boleto
          </label>
          <input
            disabled
            value={contaInfo.contaNome || "Conta padrão do sistema"}
            className={inputCalculadoStyle}
          />
          <p className="text-[10px] text-[var(--text-faint)] mt-1">
            Só pra conferir -- é onde o boleto dessa cobrança vai ser gerado.
          </p>
        </div>

      </div>

      {erro && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
          {erro}
        </div>
      )}

      <div className="flex justify-end">

        <button
          type="submit"
          disabled={salvando}
          className="
            bg-green-700
            text-[var(--text)]
            px-6
            py-3
            rounded-xl
            disabled:opacity-60
            disabled:cursor-not-allowed
          "
        >
          {salvando ? "Salvando..." : "Salvar"}
        </button>

      </div>

    </form>

    {confirmandoValor && (

      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">

        <form
          onSubmit={confirmarEdicaoValor}
          className="w-full max-w-md rounded-2xl border border-yellow-500/30 bg-[var(--surface)] p-7 space-y-5"
        >

          <h3 className="text-xl font-bold text-yellow-400">
            Confirmar edição
          </h3>

          <p className="text-sm text-[var(--text-muted)]">
            Você está editando "{receitaEditando?.descricao}". Digite o motivo e sua senha pra
            confirmar -- isso vai gerar um aviso pra equipe.
          </p>

          <div>
            <label className="block text-xs text-[var(--text-faint)] mb-1.5">
              Motivo da edição
            </label>
            <input
              type="text"
              autoFocus
              value={motivoEdicaoValor}
              onChange={(e) => setMotivoEdicaoValor(e.target.value)}
              placeholder="Ex.: corrigindo data errada, taxa, multa..."
              className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-faint)] mb-1.5">
              Sua senha
            </label>
            <input
              type="password"
              value={senhaConfirmacao}
              onChange={(e) => setSenhaConfirmacao(e.target.value)}
              className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full"
            />
          </div>

          {erroConfirmacaoValor && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {erroConfirmacaoValor}
            </div>
          )}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={() => {
                setConfirmandoValor(false);
                setPayloadPendente(null);
                setSenhaConfirmacao("");
              }}
              className="px-5 py-2.5 rounded-xl border border-[var(--border-token)] text-[var(--text-muted)]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2.5 rounded-xl bg-yellow-600 text-white font-semibold disabled:opacity-60"
            >
              {salvando ? "Confirmando..." : "Confirmar"}
            </button>

          </div>

        </form>

      </div>

    )}
    </>
  );
}
