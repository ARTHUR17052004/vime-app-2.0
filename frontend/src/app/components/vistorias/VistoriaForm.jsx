"use client";

import { useEffect, useState } from "react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";

export default function VistoriaForm({
  onSave,
  vistoriaEditando,
}) {

  const [formData, setFormData] = useState({
    unidadeNome: "",
    kitnetNome: "",

    nomeVistoria: "",

    categoria: "Preventiva",

    criticidade: "Média",

    periodicidade: "Mensal",

    responsavel: "",

    dataUltima: "",

    dataProxima: "",

    status: "PROGRAMADA",

    observacoes: "",

    fotos: [],

    checklist: {
      portao: false,
      telhado: false,
      caixaAgua: false,
      extintores: false,
      iluminacao: false,
      corredores: false,
    },
  });

  useEffect(() => {

    if (vistoriaEditando) {

      setFormData({
        ...formData,
        ...vistoriaEditando,
      });

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vistoriaEditando]);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    onSave(formData);

  };

  const input = `
    w-full
    rounded-xl
    border
    border-white/10
    bg-white/5
    px-4
    py-3
    text-white
    placeholder:text-gray-500
    outline-none
    focus:border-emerald-500
  `;

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="font-semibold text-gray-300">
            Unidade
          </label>

          <Input
            name="unidadeNome"
            value={formData.unidadeNome}
            onChange={handleChange}
            className={input}
          />

        </div>

        <div>

          <label className="font-semibold text-gray-300">
            Kitnet
          </label>

          <Input
            name="kitnetNome"
            value={formData.kitnetNome}
            onChange={handleChange}
            className={input}
          />

        </div>

      </div>

      <div>

        <label className="font-semibold text-gray-300">
          Nome da Vistoria
        </label>

        <Input
          name="nomeVistoria"
          value={formData.nomeVistoria}
          onChange={handleChange}
          placeholder="Ex: Limpeza das Áreas Comuns"
          className={input}
        />

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="font-semibold text-gray-300">
            Categoria
          </label>

          <Select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className={input}
          >

            <option>Preventiva</option>
            <option>Corretiva</option>
            <option>Inspeção</option>
            <option>Limpeza</option>
            <option>Segurança</option>
            <option>Estrutural</option>

          </Select>

        </div>

        <div>

          <label className="font-semibold text-gray-300">
            Criticidade
          </label>

          <Select
            name="criticidade"
            value={formData.criticidade}
            onChange={handleChange}
            className={input}
          >

            <option>Baixa</option>
            <option>Média</option>
            <option>Alta</option>
            <option>Crítica</option>

          </Select>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="font-semibold text-gray-300">
            Periodicidade
          </label>

          <Select
            name="periodicidade"
            value={formData.periodicidade}
            onChange={handleChange}
            className={input}
          >

            <option>Semanal</option>
            <option>Quinzenal</option>
            <option>Mensal</option>
            <option>Bimestral</option>
            <option>Trimestral</option>
            <option>Semestral</option>
            <option>Anual</option>

          </Select>

        </div>

      <div>

  <label className="font-semibold text-gray-300">
    Responsável
  </label>

  <Input
    name="responsavel"
    value={formData.responsavel}
    onChange={handleChange}
    placeholder="Nome do responsável"
    className={input}
  />

</div>

</div>

<div className="grid md:grid-cols-2 gap-6">

  <div>

    <label className="font-semibold text-gray-300">
      Data Última
    </label>

    <Input
      type="date"
      name="dataUltima"
      value={formData.dataUltima}
      onChange={handleChange}
      className={input}
    />

  </div>

  <div>

    <label className="font-semibold text-gray-300">
      Data Próxima
    </label>

    <Input
      type="date"
      name="dataProxima"
      value={formData.dataProxima}
      onChange={handleChange}
      className={input}
    />

  </div>

</div>

<div>

  <label className="font-semibold text-gray-300">
    Status
  </label>

  <Select
    name="status"
    value={formData.status}
    onChange={handleChange}
    className={input}
  >

    <option>PROGRAMADA</option>
    <option>PENDENTE</option>
    <option>REALIZADA</option>
    <option>CANCELADA</option>
    <option>ATRASADA</option>

  </Select>

</div>

<div>

  <label className="font-semibold text-gray-300 block mb-4">
    Checklist da Vistoria
  </label>

  <div className="grid md:grid-cols-2 gap-4">

    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-300">
      <input
        type="checkbox"
        checked={formData.checklist.portao}
        onChange={(e) =>
          setFormData({
            ...formData,
            checklist: {
              ...formData.checklist,
              portao: e.target.checked,
            },
          })
        }
      />
      <span>Portão</span>
    </label>

    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-300">
      <input
        type="checkbox"
        checked={formData.checklist.telhado}
        onChange={(e) =>
          setFormData({
            ...formData,
            checklist: {
              ...formData.checklist,
              telhado: e.target.checked,
            },
          })
        }
      />
      <span>Telhado</span>
    </label>

    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-300">
      <input
        type="checkbox"
        checked={formData.checklist.caixaAgua}
        onChange={(e) =>
          setFormData({
            ...formData,
            checklist: {
              ...formData.checklist,
              caixaAgua: e.target.checked,
            },
          })
        }
      />
      <span>Caixa de Água</span>
    </label>

    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-300">
      <input
        type="checkbox"
        checked={formData.checklist.extintores}
        onChange={(e) =>
          setFormData({
            ...formData,
            checklist: {
              ...formData.checklist,
              extintores: e.target.checked,
            },
          })
        }
      />
      <span>Extintores</span>
    </label>

    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-300">
      <input
        type="checkbox"
        checked={formData.checklist.iluminacao}
        onChange={(e) =>
          setFormData({
            ...formData,
            checklist: {
              ...formData.checklist,
              iluminacao: e.target.checked,
            },
          })
        }
      />
      <span>Iluminação</span>
    </label>

    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-300">
      <input
        type="checkbox"
        checked={formData.checklist.corredores}
        onChange={(e) =>
          setFormData({
            ...formData,
            checklist: {
              ...formData.checklist,
              corredores: e.target.checked,
            },
          })
        }
      />
      <span>Corredores</span>
    </label>

  </div>

</div>

<div>

  <label className="font-bold text-gray-300 text-lg block mb-4">
    Fotos da Vistoria
  </label>

  <Input
    type="file"
    multiple
    accept="image/*"
    className={input}
    onChange={(e) => {

      const arquivos = Array.from(
        e.target.files || []
      );

      arquivos.forEach((arquivo) => {

        const reader = new FileReader();

        reader.onload = () => {

          setFormData((prev) => ({

            ...prev,

            fotos: [
              ...(prev.fotos || []),
              reader.result,
            ],

          }));

        };

        reader.readAsDataURL(arquivo);

      });

    }}
  />

  {formData.fotos?.length > 0 && (

    <div className="grid md:grid-cols-3 gap-4 mt-6">

      {formData.fotos.map((foto, index) => (

        <img
          key={index}
          src={foto}
          alt={`Foto ${index}`}
          className="
            w-full
            h-40
            object-cover
            rounded-2xl
            border
            border-white/10
          "
        />

      ))}

    </div>

  )}

</div>

<div>

  <label className="font-semibold text-gray-300">
    Observações
  </label>

  <Textarea
    rows={6}
    name="observacoes"
    value={formData.observacoes}
    onChange={handleChange}
    className={`
      ${input}
      min-h-[160px]
      resize-none
    `}
  />

</div>

<div className="flex justify-end">

  <Button type="submit">
    Salvar Vistoria
  </Button>

</div>

</form>

);

}