"use client";

import { useEffect, useState } from "react";

import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";

import { LocadorService } from "@/services/locadores.service";
import { CamposObrigatoriosService } from "@/services/camposObrigatorios.service";

export default function UnitForm({
  unidade,
  onSave,
  onCancel,
}) {

  const initialState = {

    nome: "",

    cep: "",

    logradouro: "",

    numero: "",

    complemento: "",

    bairro: "",

    cidade: "",

    uf: "",

    locador: "",

    locadorId: "",

    kitnets: "",

    aluguel: "",

    vencimento: "10",

    dataInicioCobranca: "",

    status: "Ativa",

    observacoes: "",

  };

  const [formData, setFormData] =
    useState(initialState);

  const [locadores, setLocadores] =
    useState([]);

  const [obrigatorios, setObrigatorios] =
    useState(new Set());

  useEffect(() => {

    async function carregarLocadores() {

      try {

        const resposta = await LocadorService.listar();

        setLocadores(
          Array.isArray(resposta)
            ? resposta
            : resposta.data || []
        );

      } catch (err) {

        console.error("Erro ao carregar locadores:", err);

      }

    }

    async function carregarObrigatorios() {

      try {

        const resposta = await CamposObrigatoriosService.listar("residencia");

        const lista = Array.isArray(resposta) ? resposta : resposta.data || [];

        setObrigatorios(
          new Set(lista.filter((c) => c.obrigatorio).map((c) => c.campo))
        );

      } catch (err) {

        console.error("Erro ao carregar campos obrigatórios:", err);

      }

    }

    carregarLocadores();
    carregarObrigatorios();

  }, []);

  useEffect(() => {

    if (unidade) {

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({

        nome: unidade.nome || "",

        cep: unidade.cep || "",

        logradouro:
          unidade.logradouro || "",

        numero:
          unidade.numero || "",

        complemento:
          unidade.complemento || "",

        bairro:
          unidade.bairro || "",

        cidade:
          unidade.cidade || "",

        uf:
          unidade.uf || "",

        locador:
          unidade.locador || "",

        locadorId:
          unidade.locadorId || "",

        kitnets:
          unidade.kitnets || "",

        aluguel:
          unidade.aluguel || "",

        vencimento:
          unidade.vencimento || "10",

        dataInicioCobranca:
          unidade.dataInicioCobranca
            ? String(unidade.dataInicioCobranca).slice(0, 10)
            : "",

        status:
          unidade.status || "Ativa",

        observacoes:
          unidade.observacoes || "",

      });

    } else {

      setFormData(initialState);

    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unidade]);

  async function buscarCep(cep) {

    const cepLimpo =
      cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {

      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      const data =
        await response.json();

      if (data.erro) return;

      setFormData((prev) => ({

        ...prev,

        logradouro:
          data.logradouro || "",

        bairro:
          data.bairro || "",

        cidade:
          data.localidade || "",

        uf:
          data.uf || "",

      }));

    } catch {

      console.log(
        "Erro ao consultar CEP."
      );

    }

  }

  function handleChange(e) {

    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]: value,

    }));

    if (name === "cep") {

      buscarCep(value);

    }

  }

  function handleChangeLocador(e) {

    const locadorId = e.target.value;

    const selecionado = locadores.find(
      (item) => item.id === locadorId
    );

    setFormData((prev) => ({

      ...prev,

      locadorId,

      locador: selecionado?.nome || "",

    }));

  }

  function handleSubmit(e) {

    e.preventDefault();

    onSave(formData);

  }

  return (

    <form

      onSubmit={handleSubmit}

      className="space-y-10"

    >      {/* ===================================== */}
      {/* DADOS DA UNIDADE */}
      {/* ===================================== */}

      <section className="space-y-6">

        <div>

          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.35em]
              text-emerald-400
              font-semibold
            "
          >
            Dados da Residência
          </p>

          <h2
            className="
              mt-2
              text-2xl
              font-bold
              text-[var(--text)]
            "
          >
            Informações principais
          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Input
            label="Nome da Residência"
            required
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Ex.: Residencial Bela Vista"
          />

          <Input
            label="CEP"
            required={obrigatorios.has("cep")}
            name="cep"
            value={formData.cep}
            onChange={handleChange}
            placeholder="00000-000"
          />

        </div>

      </section>

      {/* ===================================== */}
      {/* ENDEREÇO */}
      {/* ===================================== */}

      <section className="space-y-6">

        <div>

          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.35em]
              text-emerald-400
              font-semibold
            "
          >
            Endereço
          </p>

          <h2
            className="
              mt-2
              text-2xl
              font-bold
              text-[var(--text)]
            "
          >
            Localização da Residência
          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Input
            label="Logradouro"
            required={obrigatorios.has("logradouro")}
            name="logradouro"
            value={formData.logradouro}
            onChange={handleChange}
          />

          <Input
            label="Número"
            required={obrigatorios.has("numero")}
            name="numero"
            value={formData.numero}
            onChange={handleChange}
          />

          <Input
            label="Complemento"
            required={obrigatorios.has("complemento")}
            name="complemento"
            value={formData.complemento}
            onChange={handleChange}
          />

          <Input
            label="Bairro"
            required={obrigatorios.has("bairro")}
            name="bairro"
            value={formData.bairro}
            onChange={handleChange}
          />

          <Input
            label="Cidade"
            required={obrigatorios.has("cidade")}
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
          />

          <Input
            label="UF"
            required={obrigatorios.has("uf")}
            name="uf"
            value={formData.uf}
            onChange={handleChange}
          />

        </div>

      </section>

      {/* ===================================== */}
      {/* INFORMAÇÕES DA UNIDADE */}
      {/* ===================================== */}

      <section className="space-y-6">

        <div>

          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.35em]
              text-emerald-400
              font-semibold
            "
          >
            Gestão
          </p>

          <h2
            className="
              mt-2
              text-2xl
              font-bold
              text-[var(--text)]
            "
          >
            Informações administrativas
          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Select
            label="Locador"
            required={obrigatorios.has("locadorId")}
            name="locadorId"
            value={formData.locadorId}
            onChange={handleChangeLocador}
          >

            <option value="">
              Selecione um locador
            </option>

            {locadores.map((item) => (

              <option key={item.id} value={item.id}>
                {item.nome}
              </option>

            ))}

          </Select>

          <Input
            label="Quantidade de Kitnets"
            required={obrigatorios.has("kitnets")}
            name="kitnets"
            value={formData.kitnets}
            onChange={handleChange}
          />

          <Input
            label="Valor do Aluguel"
            required={obrigatorios.has("aluguel")}
            name="aluguel"
            value={formData.aluguel}
            onChange={handleChange}
          />

          <Input
            label="Dia do Vencimento"
            required={obrigatorios.has("vencimento")}
            name="vencimento"
            value={formData.vencimento}
            onChange={handleChange}
          />

          <div>
            <Input
              label="Data de Início da Cobrança"
              type="date"
              name="dataInicioCobranca"
              value={formData.dataInicioCobranca}
              onChange={handleChange}
            />
            <p className="mt-1.5 text-xs text-[var(--text-faint)]">
              A partir dessa data o sistema gera a cobrança do aluguel sozinho, todo
              mês (só cobra a próxima quando a anterior já estiver paga). Deixe em
              branco para começar já.
            </p>
          </div>

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >

            <option value="Ativa">
              Ativa
            </option>

            <option value="Inativa">
              Inativa
            </option>

            <option value="Manutenção">
              Manutenção
            </option>

          </Select>

        </div>

      </section>
            {/* ===================================== */}
      {/* OBSERVAÇÕES */}
      {/* ===================================== */}

      <section className="space-y-6">

        <div>

          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.35em]
              text-emerald-400
              font-semibold
            "
          >
            Observações
          </p>

          <h2
            className="
              mt-2
              text-2xl
              font-bold
              text-[var(--text)]
            "
          >
            Informações adicionais
          </h2>

        </div>

        <Textarea

          label="Observações"

          name="observacoes"

          rows={6}

          value={formData.observacoes}

          onChange={handleChange}

          placeholder="Escreva observações importantes sobre esta residência..."

        />

      </section>

      {/* ===================================== */}
      {/* BOTÕES */}
      {/* ===================================== */}

      <div
        className="
          pt-8

          border-t
          border-[var(--border-token)]

          flex
          items-center
          justify-end

          gap-4
        "
      >

        <Button

          type="button"

          variant="secondary"

          onClick={onCancel}

        >

          Cancelar

        </Button>

        <Button

          type="submit"

        >

          {unidade
            ? "Salvar Alterações"
            : "Cadastrar Residência"}

        </Button>

      </div>
          </form>

  );

}