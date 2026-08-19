"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";

import Button from "../ui/Button";

import { LocadorService } from "@/services/locadores.service";
import { UnidadeService } from "@/services/unidades.service";
import { KitnetService } from "@/services/kitnets.service";
import { InquilinoService } from "@/services/inquilinos.service";

export default function ContratoForm({
  onSave,
  onCancel,
  contrato,
}) {

  const [locadores, setLocadores] =
    useState([]);

  const [unidades, setUnidades] =
    useState([]);

  const [kitnets, setKitnets] =
    useState([]);

  const [inquilinos, setInquilinos] =
    useState([]);

  const [salvando, setSalvando] =
    useState(false);

  const [formData, setFormData] =
    useState({

      locadorId: "",

      unidadeId: "",

      kitnetId: "",

      inquilinoId: "",

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

  async function carregarDados() {

    try {

      const [

        locadoresRes,

        unidadesRes,

        kitnetsRes,

        inquilinosRes,

      ] = await Promise.all([

        LocadorService.listar(),

        UnidadeService.listar(),

        KitnetService.listar(),

        InquilinoService.listar(),

      ]);

      setLocadores(

        Array.isArray(locadoresRes)
          ? locadoresRes
          : locadoresRes.data || []

      );

      setUnidades(

        Array.isArray(unidadesRes)
          ? unidadesRes
          : unidadesRes.data || []

      );

      setKitnets(

        Array.isArray(kitnetsRes)
          ? kitnetsRes
          : kitnetsRes.data || []

      );

      setInquilinos(

        Array.isArray(inquilinosRes)
          ? inquilinosRes
          : inquilinosRes.data || []

      );

    } catch (error) {

      console.error(
        "Erro ao carregar dados:",
        error
      );

    }

  }

  useEffect(() => {

    carregarDados();

  }, []);

  useEffect(() => {

    if (!contrato) return;

    setFormData({

      ...formData,

      ...contrato,

    });

  }, [contrato]);


      function alterarCampo(e) {

    const { name, value } = e.target;

    if (name === "locadorId") {

      setFormData((prev) => ({

        ...prev,

        locadorId: value,

        unidadeId: "",

        kitnetId: "",

        inquilinoId: "",

      }));

      return;

    }

    if (name === "unidadeId") {

      setFormData((prev) => ({

        ...prev,

        unidadeId: value,

        kitnetId: "",

        inquilinoId: "",

      }));

      return;

    }

    if (name === "kitnetId") {

      setFormData((prev) => ({

        ...prev,

        kitnetId: value,

        inquilinoId: "",

      }));

      return;

    }

    setFormData((prev) => ({

      ...prev,

      [name]: value,

    }));

  }

  async function salvar(e) {

    e.preventDefault();

    setSalvando(true);

    try {

      await onSave({

        ...formData,

        valorAluguel: Number(formData.valorAluguel),

        diaVencimento: Number(formData.diaVencimento),

        valorCaucao: formData.valorCaucao
          ? Number(formData.valorCaucao)
          : null,

        dataFim:
          formData.dataFim || null,

      });

    } catch {

      // erro já é exibido pelo chamador (onSave)

    } finally {

      setSalvando(false);

    }

  }

  const input = `
    w-full
    rounded-xl
    border
    border-[var(--border-token)]
    bg-[var(--surface-2)]
    px-4
    py-3
    text-[var(--text)]
    outline-none
    transition-all
    focus:border-emerald-500
  `;

  return (

    <form
      onSubmit={salvar}
      className="space-y-8"
    >

      <div>

        <h2
          className="
            text-3xl
            font-black
            text-[var(--text)]
          "
        >

          {contrato

            ? "Editar Contrato"

            : "Novo Contrato"}

        </h2>

        <p className="mt-2 text-[var(--text-subtle)]">

          Preencha as informações do contrato.

        </p>

      </div>

      <div className="grid md:grid-cols-2 gap-5">

        <select
          name="locadorId"
          value={formData.locadorId}
          onChange={alterarCampo}
          className={input}
          required
        >

          <option
            value=""
            style={{
              backgroundColor:"#1d2833",
              color:"#fff"
            }}
          >

            Selecione um Locador

          </option>

          {locadores.map((locador)=>(

            <option
              key={locador.id}
              value={locador.id}
              style={{
                backgroundColor:"#1d2833",
                color:"#fff"
              }}
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

          <option
            value=""
            style={{
              backgroundColor:"#1d2833",
              color:"#fff"
            }}
          >

            Selecione uma Residência

          </option>

          {unidades.map((unidade)=>(

            <option
              key={unidade.id}
              value={unidade.id}
              style={{
                backgroundColor:"#1d2833",
                color:"#fff"
              }}
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

          <option
            value=""
            style={{
              backgroundColor:"#1d2833",
              color:"#fff"
            }}
          >

            Selecione uma Kitnet

          </option>

          {kitnets.map((kitnet)=>(

            <option
              key={kitnet.id}
              value={kitnet.id}
              style={{
                backgroundColor:"#1d2833",
                color:"#fff"
              }}
            >

              {kitnet.nome || `Kitnet ${kitnet.numero}`}

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

          <option
            value=""
            style={{
              backgroundColor:"#1d2833",
              color:"#fff"
            }}
          >

            Selecione um Inquilino

          </option>

          {inquilinos.map((inquilino)=>(

            <option
              key={inquilino.id}
              value={inquilino.id}
              style={{
                backgroundColor:"#1d2833",
                color:"#fff"
              }}
            >

              {inquilino.nome}

            </option>

          ))}

        </select>

      </div>

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="mb-1.5 block text-sm text-[var(--text-subtle)]">
            Data de Criação do Contrato
          </label>

          <input
            className={input}
            type="date"
            name="dataInicio"
            value={formData.dataInicio}
            onChange={alterarCampo}
            required
          />

        </div>

        <div>

          <label className="mb-1.5 block text-sm text-[var(--text-subtle)]">
            Data Final do Contrato
          </label>

          <input
            className={input}
            type="date"
            name="dataFim"
            value={formData.dataFim}
            onChange={alterarCampo}
          />

        </div>

        <input
          className={input}
          type="number"
          name="valorAluguel"
          placeholder="Valor do aluguel"
          value={formData.valorAluguel}
          onChange={alterarCampo}
          required
        />

        <input
          className={input}
          type="number"
          name="diaVencimento"
          placeholder="Dia do vencimento"
          min={1}
          max={31}
          value={formData.diaVencimento}
          onChange={alterarCampo}
          required
        />

       <select
  name="status"
  value={formData.status}
  onChange={alterarCampo}
  className={input}
>

  <option
    value="ATIVO"
    style={{
      backgroundColor: "#1d2833",
      color: "#fff",
    }}
  >
    Ativo
  </option>

  <option
    value="PENDENTE"
    style={{
      backgroundColor: "#1d2833",
      color: "#fff",
    }}
  >
    Pendente
  </option>

  <option
    value="ENCERRADO"
    style={{
      backgroundColor: "#1d2833",
      color: "#fff",
    }}
  >
    Encerrado
  </option>

  <option
    value="ASSINADO"
    style={{
      backgroundColor: "#1d2833",
      color: "#fff",
    }}
  >
    Assinado
  </option>

</select>

</div>

<div className="grid md:grid-cols-3 gap-5">

  <select
    name="tipoGarantia"
    value={formData.tipoGarantia}
    onChange={alterarCampo}
    className={input}
  >

    <option
      value=""
      style={{
        backgroundColor: "#1d2833",
        color: "#fff",
      }}
    >
      Tipo de Garantia
    </option>

    <option
      value="CAUCAO"
      style={{
        backgroundColor: "#1d2833",
        color: "#fff",
      }}
    >
      Caução
    </option>

    <option
      value="FIADOR"
      style={{
        backgroundColor: "#1d2833",
        color: "#fff",
      }}
    >
      Fiador
    </option>

    <option
      value="SEGURO_FIANCA"
      style={{
        backgroundColor: "#1d2833",
        color: "#fff",
      }}
    >
      Seguro Fiança
    </option>

  </select>

  <input
    className={input}
    type="number"
    name="valorCaucao"
    placeholder="Valor da Caução"
    value={formData.valorCaucao}
    onChange={alterarCampo}
  />

  <input
    className={input}
    name="indiceReajuste"
    placeholder="Índice de Reajuste"
    value={formData.indiceReajuste}
    onChange={alterarCampo}
  />

</div>

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

<div
  className="
    flex
    justify-end
    gap-4
    border-t
    border-[var(--border-token)]
    pt-6
  "
>

  <Button
    type="button"
    variant="secondary"
    onClick={onCancel}
    disabled={salvando}
  >
    Cancelar
  </Button>

  <Button type="submit" disabled={salvando}>

    {salvando
      ? "Salvando..."
      : contrato
        ? "Salvar Alterações"
        : "Criar Contrato"}

  </Button>

</div>

</form>

);

}