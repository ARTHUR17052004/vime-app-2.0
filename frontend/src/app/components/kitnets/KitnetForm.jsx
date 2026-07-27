"use client";

import { useEffect, useState } from "react";

import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";

export default function KitnetForm({
  onSave,
  onCancel,
  kitnet,
}) {

  const [unidades, setUnidades] = useState([]);

  const [formData, setFormData] = useState({
    nome: "",
    unidadeId: "",
    unidadeNome: "",
    metragem: "",
    status: "Disponível",
    aluguel: "",
    numero: "",
    observacoes: "",
  });

  useEffect(() => {

    const unidadesSalvas = JSON.parse(
      localStorage.getItem("vime-unidades") || "[]"
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnidades(unidadesSalvas);

  }, []);

  useEffect(() => {

    if (kitnet) {

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({

        nome: kitnet.nome || "",
        unidadeId: kitnet.unidadeId || "",
        unidadeNome: kitnet.unidadeNome || "",
        metragem: kitnet.metragem || "",
        status: kitnet.status || "Disponível",
        aluguel: kitnet.aluguel || "",
        numero: kitnet.numero || "",
        observacoes: kitnet.observacoes || "",

      });

    } else {

      setFormData({

        nome: "",
        unidadeId: "",
        unidadeNome: "",
        metragem: "",
        status: "Disponível",
        aluguel: "",
        numero: "",
        observacoes: "",

      });

    }

  }, [kitnet]);

  function handleChange(e) {

    const { name, value } = e.target;

    if (name === "unidadeId") {

      const unidade = unidades.find(
        (u) => String(u.id) === value
      );

      setFormData((prev) => ({

        ...prev,

        unidadeId: value,

        unidadeNome: unidade?.nome || "",

      }));

      return;

    }

    setFormData((prev) => ({

      ...prev,

      [name]: value,

    }));

  }

  function handleSubmit(e) {

    e.preventDefault();

    onSave(formData);

  }

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >

      <div className="grid grid-cols-2 gap-6">

        <Input
          label="Nome da Kitnet"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
        />

        <Select
          label="Unidade"
          name="unidadeId"
          value={formData.unidadeId}
          onChange={handleChange}
          required
        >

          <option value="">
            Selecione...
          </option>

          {unidades.map((unidade) => (

            <option
              key={unidade.id}
              value={unidade.id}
            >

              {unidade.nome}

            </option>

          ))}

        </Select>

        <Input
          label="Número"
          name="numero"
          value={formData.numero}
          onChange={handleChange}
        />

        <Input
          label="Metragem (m²)"
          name="metragem"
          value={formData.metragem}
          onChange={handleChange}
        />

        <Input
          label="Valor do aluguel"
          name="aluguel"
          value={formData.aluguel}
          onChange={handleChange}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >

          <option>Disponível</option>

          <option>Ocupada</option>

          <option>Manutenção</option>

        </Select>

      </div>

      <Textarea
        label="Observações"
        rows={5}
        name="observacoes"
        value={formData.observacoes}
        onChange={handleChange}
      />

      <div className="flex justify-end gap-4 pt-4 border-t border-white/10">

        <Button
          variant="secondary"
          type="button"
          onClick={onCancel}
        >
          Cancelar
        </Button>

        <Button type="submit">

          {kitnet
            ? "Salvar Alterações"
            : "Cadastrar Kitnet"}

        </Button>

      </div>

    </form>

  );

}