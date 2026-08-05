"use client";

import { useEffect, useState } from "react";

import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";

export default function UsuariosForm({
  usuario,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    perfil: "ADMINISTRATIVO",
    senha: "",
    ativo: true,
  });

  useEffect(() => {
    if (!usuario) {
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        perfil: "ADMINISTRATIVO",
        senha: "",
        ativo: true,
      });

      return;
    }

    setFormData({
      nome: usuario.nome || "",
      email: usuario.email || "",
      telefone: usuario.telefone || "",
      perfil: usuario.perfil || "ADMINISTRATIVO",
      senha: "",
      ativo: usuario.ativo ?? true,
    });
  }, [usuario]);

  function alterarCampo(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function gerarSenha() {
    const senha = Math.random().toString(36).slice(-10);

    setFormData((prev) => ({
      ...prev,
      senha,
    }));
  }

  function salvar(e) {
    e.preventDefault();

    onSave(formData);
  }

  return (
    <form
      onSubmit={salvar}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-black text-white">
          {usuario ? "Editar Usuário" : "Novo Usuário"}
        </h2>

        <p className="mt-2 text-gray-400">
          Configure o acesso do usuário ao sistema.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Input
          label="Nome"
          name="nome"
          value={formData.nome}
          onChange={alterarCampo}
          required
        />

        <Input
          label="E-mail"
          type="email"
          name="email"
          value={formData.email}
          onChange={alterarCampo}
          required
        />

        <Input
          label="Telefone"
          name="telefone"
          value={formData.telefone}
          onChange={alterarCampo}
        />

        <Select
          label="Perfil"
          name="perfil"
          value={formData.perfil}
          onChange={alterarCampo}
          options={[
            {
              label: "Administrador",
              value: "ADMINISTRADOR",
            },
            {
              label: "Administrativo",
              value: "ADMINISTRATIVO",
            },
            {
              label: "Zelador",
              value: "ZELADOR",
            },
          ]}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Input
          label="Senha Temporária"
          type="text"
          name="senha"
          value={formData.senha}
          onChange={alterarCampo}
        />
      </div>

      <div className="flex">
        <Button
          type="button"
          variant="secondary"
          onClick={gerarSenha}
        >
          Gerar Senha Automática
        </Button>
      </div>

      <div className="flex">
        <label className="flex items-center gap-3 text-white">
          <input
            type="checkbox"
            name="ativo"
            checked={formData.ativo}
            onChange={alterarCampo}
          />

          Usuário Ativo
        </label>
      </div>

      <div
        className="
          flex
          justify-end
          gap-4
          border-t
          border-white/10
          pt-6
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
          {usuario ? "Salvar Alterações" : "Criar Usuário"}
        </Button>
      </div>
    </form>
  );
}