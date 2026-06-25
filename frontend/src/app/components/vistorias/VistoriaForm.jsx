"use client";

import { useEffect, useState } from "react";

export default function VistoriaForm({
  onSave,
  vistoriaEditando,
}) {

  const [formData, setFormData] =
    useState({
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

      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      [e.target.name]:
        e.target.value,
    });

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    onSave(formData);

  };

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="font-semibold text-gray-900">
            Unidade
          </label>

          <input
            name="unidadeNome"
            value={formData.unidadeNome}
            onChange={handleChange}
            className="
              w-full
              border
              rounded-2xl
              p-4
              mt-2
              text-gray-900
            "
          />

        </div>

        <div>

          <label className="font-semibold text-gray-900">
            Kitnet
          </label>

          <input
            name="kitnetNome"
            value={formData.kitnetNome}
            onChange={handleChange}
            className="
              w-full
              border
              rounded-2xl
              p-4
              mt-2
              text-gray-900
            "
          />

        </div>

      </div>

      <div>

        <label className="font-semibold text-gray-900">
          Nome da Vistoria
        </label>

        <input
          name="nomeVistoria"
          value={formData.nomeVistoria}
          onChange={handleChange}
          className="
            w-full
            border
            rounded-2xl
            p-4
            mt-2
            text-gray-900
          "
          placeholder="Ex: Limpeza das Áreas Comuns"
        />

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="font-semibold text-gray-900">
            Categoria
          </label>

          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className="
              w-full
              border
              rounded-2xl
              p-4
              mt-2
              text-gray-900
            "
          >

            <option>
              Preventiva
            </option>

            <option>
              Corretiva
            </option>

            <option>
              Inspeção
            </option>

            <option>
              Limpeza
            </option>

            <option>
              Segurança
            </option>

            <option>
              Estrutural
            </option>

          </select>

        </div>

        <div>

          <label className="font-semibold text-gray-900">
            Criticidade
          </label>

          <select
            name="criticidade"
            value={formData.criticidade}
            onChange={handleChange}
            className="
              w-full
              border
              rounded-2xl
              p-4
              mt-2
              text-gray-900
            "
          >

            <option>
              Baixa
            </option>

            <option>
              Média
            </option>

            <option>
              Alta
            </option>

            <option>
              Crítica
            </option>

          </select>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="font-semibold text-gray-900">
            Periodicidade
          </label>

          <select
            name="periodicidade"
            value={formData.periodicidade}
            onChange={handleChange}
            className="
              w-full
              border
              rounded-2xl
              p-4
              mt-2
              text-gray-900
            "
          >

            <option>
              Semanal
            </option>

            <option>
              Quinzenal
            </option>

            <option>
              Mensal
            </option>

            <option>
              Bimestral
            </option>

            <option>
              Trimestral
            </option>

            <option>
              Semestral
            </option>

            <option>
              Anual
            </option>

          </select>

        </div>

        <div>

          <label className="font-semibold text-gray-900">
            Responsável
          </label>

          <input
            name="responsavel"
            value={formData.responsavel}
            onChange={handleChange}
            className="
              w-full
              border
              rounded-2xl
              p-4
              mt-2
              text-gray-900
            "
            placeholder="Nome do responsável"
          />

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="font-semibold text-gray-900">
            Data Última
          </label>

          <input
            type="date"
            name="dataUltima"
            value={formData.dataUltima}
            onChange={handleChange}
            className="
              w-full
              border
              rounded-2xl
              p-4
              mt-2
              text-gray-900
            "
          />

        </div>

        <div>

          <label className="font-semibold text-gray-900">
            Data Próxima
          </label>

          <input
            type="date"
            name="dataProxima"
            value={formData.dataProxima}
            onChange={handleChange}
            className="
              w-full
              border
              rounded-2xl
              p-4
              mt-2
              text-gray-900
            "
          />

        </div>

      </div>

      <div>

        <label className="font-semibold text-gray-900">
          Status
        </label>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="
            w-full
            border
            rounded-2xl
            p-4
            mt-2
            text-gray-900
          "
        >

          <option>PROGRAMADA</option>
          <option>PENDENTE</option>
          <option>REALIZADA</option>
          <option>CANCELADA</option>
          <option>ATRASADA</option>

        </select>

      </div>

      <div>

  <label className="font-semibold text-gray-900 block mb-4">
    Checklist da Vistoria
  </label>

  <div className="grid md:grid-cols-2 gap-4">

    <label className="flex items-center gap-3 border rounded-2xl p-4">
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
      <span className="text-gray-900">Portão</span>
    </label>

    <label className="flex items-center gap-3 border rounded-2xl p-4">
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
      <span className="text-gray-900">Telhado</span>
    </label>

    <label className="flex items-center gap-3 border rounded-2xl p-4">
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
      <span className="text-gray-900">Caixa de Água</span>
    </label>

    <label className="flex items-center gap-3 border rounded-2xl p-4">
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
      <span className="text-gray-900">Extintores</span>
    </label>

    <label className="flex items-center gap-3 border rounded-2xl p-4">
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
      <span className="text-gray-900">Iluminação</span>
    </label>

    <label className="flex items-center gap-3 border rounded-2xl p-4">
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
      <span className="text-gray-900">Corredores</span>
    </label>

  </div>

</div>

<div>

  <label className="font-bold text-gray-900 text-lg block mb-4">
    Fotos da Vistoria
  </label>

  <input
    type="file"
    multiple
    accept="image/*"
    className="
      w-full
      border
      rounded-2xl
      p-4
      text-gray-900
    "
    onChange={(e) => {

      const arquivos =
        Array.from(
          e.target.files || []
        );

      arquivos.forEach(
        (arquivo) => {

          const reader =
            new FileReader();

          reader.onload =
            () => {

              setFormData(
                (prev) => ({

                  ...prev,

                  fotos: [

                    ...(prev.fotos || []),

                    reader.result,

                  ],

                })
              );

            };

          reader.readAsDataURL(
            arquivo
          );

        }
      );

    }}
  />

  {formData.fotos?.length > 0 && (

    <div className="grid md:grid-cols-3 gap-4 mt-6">

      {formData.fotos.map(
        (foto, index) => (

          // eslint-disable-next-line @next/next/no-img-element
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
            "
          />

        )
      )}

    </div>

  )}

</div>

<div>

  <label className="font-semibold text-gray-900">
    Observações
  </label>

  <textarea
    rows={6}
    name="observacoes"
    value={formData.observacoes}
    onChange={handleChange}
    className="
      w-full
      border
      rounded-2xl
      p-4
      mt-2
      text-gray-900
    "
  />

</div>

<button
  type="submit"
  className="
    bg-green-700
    text-white
    px-8
    py-4
    rounded-2xl
    hover:bg-green-800
  "
>
  Salvar Vistoria
</button>

</form>

  );

}