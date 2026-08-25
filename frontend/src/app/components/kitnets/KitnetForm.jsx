"use client";

import { useEffect, useState } from "react";

import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";

import { UnidadeService } from "@/services/unidades.service";
import { CamposObrigatoriosService } from "@/services/camposObrigatorios.service";

export default function KitnetForm({
  onSave,
  onCancel,
  kitnet,
}) {

  const [unidades, setUnidades] = useState([]);

  const [obrigatorios, setObrigatorios] = useState(new Set());

  const [formData, setFormData] = useState({
    nome: "",
    unidadeId: "",
    unidadeNome: "",
    numero: "",
    metragem: "",
    aluguel: "",
    status: "DISPONIVEL",
    observacoes: "",
  });

  /* ======================================
     CARREGA UNIDADES
  ====================================== */

  useEffect(() => {

    async function carregarUnidades() {

      try {

        const resposta =
          await UnidadeService.listar();

        const lista = Array.isArray(resposta)
          ? resposta
          : resposta.data || [];

        setUnidades(lista);

      } catch (err) {

        console.error(
          "Erro ao carregar unidades:",
          err
        );

      }

    }

    async function carregarObrigatorios() {

      try {

        const resposta = await CamposObrigatoriosService.listar("kitnet");
        const lista = Array.isArray(resposta) ? resposta : resposta.data || [];

        setObrigatorios(
          new Set(lista.filter((c) => c.obrigatorio).map((c) => c.campo))
        );

      } catch (err) {

        console.error(err);

      }

    }

    carregarUnidades();
    carregarObrigatorios();

  }, []);

  /* ======================================
     EDIÇÃO
  ====================================== */

  useEffect(() => {

    if (kitnet) {

      setFormData({

        nome: kitnet.nome || "",

        unidadeId:
          kitnet.unidadeId || "",

        unidadeNome:
          kitnet.unidadeNome || "",

        numero:
          kitnet.numero || "",

        metragem:
          kitnet.metragem || "",

        aluguel:
          kitnet.aluguel || "",

        status:
          kitnet.status || "DISPONIVEL",

        observacoes:
          kitnet.observacoes || "",

      });

    } else {

      setFormData({

        nome: "",
        unidadeId: "",
        unidadeNome: "",
        numero: "",
        metragem: "",
        aluguel: "",
        status: "DISPONIVEL",
        observacoes: "",

      });

    }

  }, [kitnet]);

  /* ======================================
     ALTERAÇÃO
  ====================================== */

  function handleChange(e) {

    const { name, value } = e.target;

    if (name === "unidadeId") {

      const unidade = unidades.find(
        (u) => String(u.id) === value
      );

      setFormData((prev) => ({

        ...prev,

        unidadeId: value,

        unidadeNome:
          unidade?.nome || "",

      }));

      return;

    }

    setFormData((prev) => ({

      ...prev,

      [name]: value,

    }));

  }

  /* ======================================
     SALVAR
  ====================================== */

  function handleSubmit(e) {

    e.preventDefault();

    onSave({

      nome: formData.nome,

      unidadeId: formData.unidadeId,

      numero: formData.numero,

      metragem: Number(formData.metragem),

      aluguel: Number(formData.aluguel),

      status: formData.status,

      observacoes: formData.observacoes,

    });

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
          label="Residência"
          name="unidadeId"
          value={formData.unidadeId}
          onChange={handleChange}
          required
        >

          <option
            value=""
            style={{
              backgroundColor:"#1d2833",
              color:"#fff",
            }}
          >
            Selecione...
          </option>

          {unidades.map((unidade) => (

            <option
              key={unidade.id}
              value={unidade.id}
              style={{
                backgroundColor:"#1d2833",
                color:"#fff",
              }}
            >
              {unidade.nome}
            </option>

          ))}

        </Select>

        <Input
          label="Número"
          required={obrigatorios.has("numero")}
          name="numero"
          value={formData.numero}
          onChange={handleChange}
        />

        <Input
          label="Metragem (m²)"
          required={obrigatorios.has("metragem")}
          name="metragem"
          type="number"
          value={formData.metragem}
          onChange={handleChange}
        />

        <Input
          label="Valor do aluguel"
          required={obrigatorios.has("aluguel")}
          name="aluguel"
          type="number"
          value={formData.aluguel}
          onChange={handleChange}
        />

        <Select
          label="Status"
          required={obrigatorios.has("status")}
          name="status"
          value={formData.status}
          onChange={handleChange}
        >

          <option
            value="DISPONIVEL"
            style={{
              backgroundColor:"#1d2833",
              color:"#fff",
            }}
          >
            Disponível
          </option>

          <option
            value="OCUPADA"
            style={{
              backgroundColor:"#1d2833",
              color:"#fff",
            }}
          >
            Ocupada
          </option>

          <option
            value="MANUTENCAO"
            style={{
              backgroundColor:"#1d2833",
              color:"#fff",
            }}
          >
            Manutenção
          </option>

        </Select>

      </div>

      <Textarea
        label="Observações"
        required={obrigatorios.has("observacoes")}
        rows={5}
        name="observacoes"
        value={formData.observacoes}
        onChange={handleChange}
      />

      <div
        className="
          flex
          justify-end
          gap-4
          pt-4
          border-t
          border-[var(--border-token)]
        "
      >

        <Button
          type="button"
          variant="secondary"
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