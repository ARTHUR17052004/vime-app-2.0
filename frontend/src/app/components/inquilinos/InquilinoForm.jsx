"use client";

import { useEffect, useState } from "react";

import { KitnetService } from "../../../services/kitnets.service";

import DadosPessoaisStep from "./steps/DadosPessoaisStep";
import KitnetStep from "./steps/KitnetStep";
import ContratoStep from "./steps/ContratoStep";

export default function InquilinoForm({
  onSave,
  inquilino,
  salvando = false,
}) {

  const [step, setStep] = useState(1);

  const [kitnets, setKitnets] = useState([]);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    enderecoAnterior: "",
    contatoEmergencia: "",
    telefoneEmergencia: "",

    kitnetId: "",

    dataInicioContrato: "",
    dataFimContrato: "",
    prazoContrato: "",
    indiceReajuste: "",

    ativo: true,
  });

  useEffect(() => {

    async function carregarKitnets() {

      try {

        const resposta =
          await KitnetService.listar();

        const lista = Array.isArray(resposta)

          ? resposta

          : resposta.data || [];

        setKitnets(lista);

      } catch (err) {

        console.error(err);

      }

    }

    carregarKitnets();

  }, []);

  useEffect(() => {

    if (!inquilino) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({

      nome: inquilino.nome || "",
      email: inquilino.email || "",
      telefone: inquilino.telefone || "",
      cpf: inquilino.cpf || "",
      rg: inquilino.rg || "",
      dataNascimento:
        inquilino.dataNascimento || "",
      enderecoAnterior:
        inquilino.enderecoAnterior || "",
      contatoEmergencia:
        inquilino.contatoEmergencia || "",
      telefoneEmergencia:
        inquilino.telefoneEmergencia || "",

      kitnetId:
        inquilino.kitnetId || "",

      dataInicioContrato:
        inquilino.dataInicioContrato || "",

      dataFimContrato:
        inquilino.dataFimContrato || "",

      prazoContrato:
        inquilino.prazoContrato || "",

      indiceReajuste:
        inquilino.indiceReajuste || "",

      ativo:
        inquilino.ativo ?? true,

    });

  }, [inquilino]);

  function handleChange(e) {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,

    }));

  }

  function proximoStep() {

    setStep((prev) => prev + 1);

  }

  function voltarStep() {

    setStep((prev) => prev - 1);

  }

  function handleSubmit(e) {

    e.preventDefault();

    if (salvando) return;

    const kitnetSelecionada =
      kitnets.find(

        (item) =>

          String(item.id) ===
          String(formData.kitnetId)

      );

    onSave({

      ...formData,

      kitnetNome:
        kitnetSelecionada
          ? `APT ${kitnetSelecionada.numero}`
          : "",

      unidadeNome:
        kitnetSelecionada?.unidade?.nome ||
        kitnetSelecionada?.unidadeNome ||
        "",

    });

  }

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >

      <div className="flex items-center justify-center gap-4">

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-[var(--text)] font-semibold ${
            step >= 1
              ? "bg-emerald-600"
              : "bg-[var(--surface-3)]"
          }`}
        >
          1
        </div>

        <div className="w-16 h-1 bg-[var(--surface-3)]" />

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-[var(--text)] font-semibold ${
            step >= 2
              ? "bg-emerald-600"
              : "bg-[var(--surface-3)]"
          }`}
        >
          2
        </div>

        <div className="w-16 h-1 bg-[var(--surface-3)]" />

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-[var(--text)] font-semibold ${
            step >= 3
              ? "bg-emerald-600"
              : "bg-[var(--surface-3)]"
          }`}
        >
          3
        </div>

      </div>

      {step === 1 && (

        <DadosPessoaisStep
          formData={formData}
          handleChange={handleChange}
        />

      )}

      {step === 2 && (

        <KitnetStep
          formData={formData}
          handleChange={handleChange}
          kitnets={kitnets}
        />

      )}

      {step === 3 && (

        <ContratoStep
          formData={formData}
          handleChange={handleChange}
        />

      )}

      <div className="flex justify-between">

        {step > 1 ? (

          <button
            type="button"
            onClick={voltarStep}
            className="px-6 py-3 rounded-lg border border-[var(--border-token)] text-[var(--text)] hover:bg-[var(--surface-2)] transition-all"
          >
            Voltar
          </button>

        ) : (

          <div />

        )}

        {step < 3 ? (

          <button
            type="button"
            onClick={proximoStep}
            className="bg-emerald-600 hover:bg-emerald-700 text-[var(--text)] px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Continuar
          </button>

        ) : (

          <button
            type="submit"
            disabled={salvando}
            className="bg-emerald-600 hover:bg-emerald-700 text-[var(--text)] px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {salvando
              ? "Salvando..."
              : inquilino
                ? "Salvar Alterações"
                : "Salvar Inquilino"}
          </button>

        )}

      </div>

    </form>

  );

}