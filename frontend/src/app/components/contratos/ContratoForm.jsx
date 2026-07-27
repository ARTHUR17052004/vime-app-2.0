  /* eslint-disable react-hooks/set-state-in-effect */
  "use client";

  import { useEffect, useMemo, useState } from "react";

  export default function ContratoForm({
    onSave,
    contrato,
  }) {

    const [locadores, setLocadores] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [kitnets, setKitnets] = useState([]);
    const [inquilinos, setInquilinos] = useState([]);

    const [formData, setFormData] = useState({
      numeroContrato: "",

      locadorId: "",
      locadorNome: "",

      unidadeId: "",
      unidadeNome: "",

      kitnetId: "",
      kitnetNome: "",

      inquilinoId: "",
      inquilinoNome: "",

      dataInicio: "",
      dataFim: "",

      valorAluguel: "",

      diaVencimento: "",

      tipoGarantia: "",

      valorCaucao: "",

      indiceReajuste: "",

      status: "ATIVO",

      observacoes: "",
    });

    useEffect(() => {

      setLocadores(
        JSON.parse(
          localStorage.getItem("vime-locadores") || "[]"
        )
      );

      setUnidades(
        JSON.parse(
          localStorage.getItem("vime-unidades") || "[]"
        )
      );

      setKitnets(
        JSON.parse(
          localStorage.getItem("vime-kitnets") || "[]"
        )
      );

      setInquilinos(
        JSON.parse(
          localStorage.getItem("vime-inquilinos") || "[]"
        )
      );

    }, []);

    useEffect(() => {

      if (!contrato) return;

      setFormData({
        ...formData,
        ...contrato,
      });

    }, [contrato, formData]);

    const unidadesFiltradas = useMemo(() => {

      return unidades.filter(

        (u) =>

          String(u.locadorId) ===

          String(formData.locadorId)

      );

    }, [unidades, formData.locadorId]);

    const kitnetsFiltradas = useMemo(() => {

      return kitnets.filter(

        (k) =>

          String(k.unidadeId) ===

          String(formData.unidadeId)

      );

    }, [kitnets, formData.unidadeId]);

    const inquilinosFiltrados = useMemo(() => {

      return inquilinos.filter(

        (i) =>

          String(i.kitnetId) ===

          String(formData.kitnetId)

      );

    }, [inquilinos, formData.kitnetId]);

    function alterarCampo(e) {

      const { name, value } = e.target;

      setFormData((prev) => ({

        ...prev,

        [name]: value,

      }));

    }

    function salvar(e) {

      e.preventDefault();

      const locador = locadores.find(

        (l) =>

          String(l.id) ===

          String(formData.locadorId)

      );

      const unidade = unidades.find(

        (u) =>

          String(u.id) ===

          String(formData.unidadeId)

      );

      const kitnet = kitnets.find(

        (k) =>

          String(k.id) ===

          String(formData.kitnetId)

      );

      const inquilino = inquilinos.find(

        (i) =>

          String(i.id) ===

          String(formData.inquilinoId)

      );

      const contratoCompleto = {

        ...formData,

        locadorNome: locador?.nome || "",

        unidadeNome: unidade?.nome || "",

        kitnetNome: kitnet?.nome || "",

        inquilinoNome: inquilino?.nome || "",

      };

      onSave(contratoCompleto);

    }

    const input = `
      w-full
      rounded-xl
      border
      border-white/10
      bg-white/5
      px-4
      py-3
      text-white
      outline-none
      focus:border-emerald-500
    `;
    return (

  <form
    onSubmit={salvar}
    className="space-y-8"
  >

    {/* CABEÇALHO */}

    <div>

      <h2
        className="
          text-3xl
          font-black
          text-white
        "
      >

        {contrato
          ? "Editar Contrato"
          : "Novo Contrato"}

      </h2>

      <p className="text-gray-400 mt-2">

        Preencha as informações do contrato.

      </p>

    </div>

    {/* LOCALIZAÇÃO */}

    <div className="grid md:grid-cols-2 gap-5">

      <select
        name="locadorId"
        value={formData.locadorId}
        onChange={alterarCampo}
        className={input}
        required
      >

        <option value="">
          Selecione um Locador
        </option>

        {locadores.map((locador)=>(

          <option
            key={locador.id}
            value={locador.id}
          >

            {locador.nome}

          </option>

        ))}

      </select>

      <select
        name="unidadeId"
        value={formData.unidadeId}
        onChange={alterarCampo}
        className={input}
        required
      >

        <option value="">
          Selecione uma Unidade
        </option>

        {unidadesFiltradas.map((unidade)=>(

          <option
            key={unidade.id}
            value={unidade.id}
          >

            {unidade.nome}

          </option>

        ))}

      </select>

      <select
        name="kitnetId"
        value={formData.kitnetId}
        onChange={alterarCampo}
        className={input}
        required
      >

        <option value="">
          Selecione uma Kitnet
        </option>

        {kitnetsFiltradas.map((kitnet)=>(

          <option
            key={kitnet.id}
            value={kitnet.id}
          >

            {kitnet.nome}

          </option>

        ))}

      </select>

      <select
        name="inquilinoId"
        value={formData.inquilinoId}
        onChange={alterarCampo}
        className={input}
        required
      >

        <option value="">
          Selecione um Inquilino
        </option>

        {inquilinosFiltrados.map((inquilino)=>(

          <option
            key={inquilino.id}
            value={inquilino.id}
          >

            {inquilino.nome}

          </option>

        ))}

      </select>

    </div>

    {/* DADOS */}

    <div className="grid md:grid-cols-2 gap-5">

      <input
        className={input}
        name="numeroContrato"
        placeholder="Número do Contrato"
        value={formData.numeroContrato}
        onChange={alterarCampo}
      />

      <input
        className={input}
        type="number"
        name="valorAluguel"
        placeholder="Valor do aluguel"
        value={formData.valorAluguel}
        onChange={alterarCampo}
      />

      <input
        className={input}
        type="date"
        name="dataInicio"
        value={formData.dataInicio}
        onChange={alterarCampo}
      />

      <input
        className={input}
        type="date"
        name="dataFim"
        value={formData.dataFim}
        onChange={alterarCampo}
      />

      <input
        className={input}
        type="number"
        name="diaVencimento"
        placeholder="Dia do vencimento"
        value={formData.diaVencimento}
        onChange={alterarCampo}
      />

      <select
        className={input}
        name="status"
        value={formData.status}
        onChange={alterarCampo}
      >

        <option value="ATIVO">Ativo</option>

        <option value="PENDENTE">Pendente</option>

        <option value="INADIMPLENTE">Inadimplente</option>

        <option value="ENCERRADO">Encerrado</option>

      </select>

    </div>
      {/* GARANTIA */}

    <div className="grid md:grid-cols-3 gap-5">

      <select
        name="tipoGarantia"
        value={formData.tipoGarantia}
        onChange={alterarCampo}
        className={input}
      >

        <option value="">
          Tipo de Garantia
        </option>

        <option value="CAUCAO">
          Caução
        </option>

        <option value="FIADOR">
          Fiador
        </option>

        <option value="SEGURO_FIANCA">
          Seguro Fiança
        </option>

      </select>

      <input
        name="valorCaucao"
        type="number"
        placeholder="Valor Caução"
        value={formData.valorCaucao}
        onChange={alterarCampo}
        className={input}
      />

      <input
        name="indiceReajuste"
        placeholder="Índice de Reajuste"
        value={formData.indiceReajuste}
        onChange={alterarCampo}
        className={input}
      />

    </div>

    {/* OBSERVAÇÕES */}

    <textarea
      name="observacoes"
      value={formData.observacoes}
      onChange={alterarCampo}
      placeholder="Observações..."
      className={`
        ${input}

        min-h-[140px]

        resize-none
      `}
    />

    {/* BOTÕES */}

    <div className="flex justify-end gap-4 pt-6">

      <button
        type="button"
        onClick={() => history.back()}
        className="
          rounded-xl

          border
          border-white/10

          px-6
          py-3

          text-gray-300

          transition

          hover:bg-white/5
        "
      >
        Cancelar
      </button>

      <button
        type="submit"
        className="
          rounded-xl

          bg-emerald-500

          px-8
          py-3

          font-semibold

          text-white

          transition

          hover:bg-emerald-600
        "
      >
        {contrato
          ? "Salvar Alterações"
          : "Criar Contrato"}
      </button>

    </div>

  </form>

  );
  }