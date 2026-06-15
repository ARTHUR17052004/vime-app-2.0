"use client";

import { useEffect, useState } from "react";

import DadosPessoaisStep from "./steps/DadosPessoaisStep";
import KitnetStep from "./steps/KitnetStep";
import ContratoStep from "./steps/ContratoStep";

export default function InquilinoForm({
  onSave,
  inquilino,
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
    tipoGarantia: "",
    valorCaucao: "",
    indiceReajuste: "",

    ativo: true,
  });

  useEffect(() => {
    const dados = JSON.parse(
      localStorage.getItem("vime-kitnets") || "[]"
    );

    setKitnets(dados);
  }, []);

  useEffect(() => {
    if (!inquilino) return;

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

      kitnetId: inquilino.kitnetId || "",

      dataInicioContrato:
        inquilino.dataInicioContrato || "",

      dataFimContrato:
        inquilino.dataFimContrato || "",

      prazoContrato:
        inquilino.prazoContrato || "",

      tipoGarantia:
        inquilino.tipoGarantia || "",

      valorCaucao:
        inquilino.valorCaucao || "",

      indiceReajuste:
        inquilino.indiceReajuste || "",

      ativo:
        inquilino.ativo ?? true,
    });
  }, [inquilino]);

  const handleChange = (e) => {
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
  };

  const proximoStep = () => {
    setStep((prev) => prev + 1);
  };

  const voltarStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const kitnetSelecionada = kitnets.find(
      (item) =>
        String(item.id) ===
        String(formData.kitnetId)
    );

    const dadosCompletos = {
      ...formData,

      kitnetNome: kitnetSelecionada
        ? `APT ${kitnetSelecionada.numero}`
        : "",

      unidadeNome:
        kitnetSelecionada?.unidadeNome || "",
    };

    onSave(dadosCompletos);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <div className="flex items-center justify-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
            step >= 1
              ? "bg-green-700"
              : "bg-gray-300"
          }`}
        >
          1
        </div>

        <div className="w-16 h-1 bg-gray-300" />

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
            step >= 2
              ? "bg-green-700"
              : "bg-gray-300"
          }`}
        >
          2
        </div>

        <div className="w-16 h-1 bg-gray-300" />

        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
            step >= 3
              ? "bg-green-700"
              : "bg-gray-300"
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
            className="
              px-6
              py-3
              rounded-lg
              border
              border-gray-300
            "
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
            className="
              bg-green-600
              text-white
              px-6
              py-3
              rounded-lg
            "
          >
            Continuar
          </button>
        ) : (
          <button
            type="submit"
            className="
              bg-green-700
              text-white
              px-6
              py-3
              rounded-lg
            "
          >
            {inquilino
              ? "Salvar Alterações"
              : "Salvar Inquilino"}
          </button>
        )}
      </div>
    </form>
  );
}