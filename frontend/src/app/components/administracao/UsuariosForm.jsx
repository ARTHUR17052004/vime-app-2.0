"use client";

import { useEffect, useState } from "react";

import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";

import { PerfilService } from "@/services/perfis.service";

export default function UsuariosForm({
  usuario,
  onSave,
  onCancel,
}) {
  const [perfis, setPerfis] = useState([]);

  const [salvando, setSalvando] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    perfilId: "",
    senha: "",
    ativo: true,
  });

  useEffect(() => {
    async function carregarPerfis() {
      try {
        const resposta = await PerfilService.listar();

        setPerfis(
          Array.isArray(resposta)
            ? resposta
            : resposta.data || []
        );
      } catch (err) {
        console.error("Erro ao carregar perfis:", err);
      }
    }

    carregarPerfis();
  }, []);

  useEffect(() => {
    if (!usuario) {
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        perfilId: "",
        senha: "",
        ativo: true,
      });

      return;
    }

    setFormData({
      nome: usuario.nome || "",
      email: usuario.email || "",
      telefone: usuario.telefone || "",
      perfilId: usuario.perfil?.id || usuario.perfilId || "",
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

  async function salvar(e) {
    e.preventDefault();

    setSalvando(true);

    try {
      await onSave(formData);
    } catch {
      // erro já é exibido pelo chamador (onSave)
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={salvar}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-black text-[var(--text)]">
          {usuario ? "Editar Usuário" : "Novo Usuário"}
        </h2>

        <p className="mt-2 text-[var(--text-subtle)]">
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
          name="perfilId"
          value={formData.perfilId}
          onChange={alterarCampo}
          required
          options={[
            {
              label: "Selecione um perfil",
              value: "",
            },
            ...perfis.map((perfil) => ({
              label: perfil.nome,
              value: perfil.id,
            })),
          ]}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Input
          label={usuario ? "Nova Senha" : "Senha"}
          type="text"
          name="senha"
          value={formData.senha}
          onChange={alterarCampo}
          placeholder={usuario ? "Deixe em branco para manter a senha atual" : ""}
          required={!usuario}
        />
      </div>

      <p className="text-sm text-[var(--text-subtle)] -mt-3">
        Essa é a senha definitiva do usuário para entrar no sistema -- não
        expira nem precisa ser trocada depois. Digite a senha que quiser ou
        gere uma automática abaixo.
      </p>

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
        <label className="flex items-center gap-3 text-[var(--text)]">
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
            : usuario ? "Salvar Alterações" : "Criar Usuário"}
        </Button>
      </div>
    </form>
  );
}