"use client";

import { useEffect, useState } from "react";

import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";

import { WhatsappService } from "../../../services/whatsapp.service";

export default function WhatsappConfigCard({
  dados,
  onAtualizar,
}) {
  const [form, setForm] = useState({
    nomeConexao: "",
    numero: "",
    provider: "META",
    webhook: "",
  });

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!dados) return;

    setForm({
      nomeConexao: dados.nomeConexao || "",
      numero: dados.numero || "",
      provider: dados.provider || "META",
      webhook: dados.webhook || "",
    });
  }, [dados]);

  async function salvar() {
    try {
      setSalvando(true);

      await WhatsappService.salvarConfiguracao(form);

      alert("Configuração salva com sucesso!");

      onAtualizar?.();
    } catch (error) {
      console.error(error);

      alert("Erro ao salvar configuração.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-[#101827]
        p-8
        shadow-xl
      "
    >
      <h2 className="mb-6 text-2xl font-bold text-white">
        Configuração da Conexão
      </h2>

      <div className="grid md:grid-cols-2 gap-5">

        <Input
          label="Nome da Conexão"
          value={form.nomeConexao}
          onChange={(e) =>
            setForm({
              ...form,
              nomeConexao: e.target.value,
            })
          }
        />

        <Input
          label="Número"
          value={form.numero}
          onChange={(e) =>
            setForm({
              ...form,
              numero: e.target.value,
            })
          }
        />

        <Select
          label="Provider"
          value={form.provider}
          onChange={(e) =>
            setForm({
              ...form,
              provider: e.target.value,
            })
          }
          options={[
            {
              label: "Meta Cloud API",
              value: "META",
            },
            {
              label: "UltraMsg",
              value: "ULTRAMSG",
            },
          ]}
        />

        <Input
          label="Webhook"
          value={form.webhook}
          onChange={(e) =>
            setForm({
              ...form,
              webhook: e.target.value,
            })
          }
        />

      </div>

      <div className="mt-8 flex gap-4 flex-wrap">

        <Button
          onClick={salvar}
          disabled={salvando}
        >
          {salvando
            ? "Salvando..."
            : "Salvar Configuração"}
        </Button>

        <Button
          variant="secondary"
          onClick={onAtualizar}
        >
          Atualizar Status
        </Button>

      </div>

    </div>
  );
}