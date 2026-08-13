"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";

import { UsuarioService } from "@/services/usuarios.service";
import { useAuth } from "../../../context/AuthContext";

export default function AlterarSenhaModal({ isOpen, onClose }) {
  const { usuario } = useAuth();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const fechar = () => {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setErro("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("A confirmação não corresponde à nova senha.");
      return;
    }

    try {
      setSalvando(true);

      await UsuarioService.redefinirSenha(
        usuario.id,
        novaSenha,
        senhaAtual
      );

      fechar();
    } catch (err) {
      setErro(err.message || "Erro ao alterar senha.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={fechar}
      title="Alterar Senha"
      subtitle="Atualize sua senha de acesso."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {erro && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {erro}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Senha Atual
          </label>
          <input
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
            className="
              w-full rounded-xl border border-white/10 bg-white/5
              px-4 py-3 text-white outline-none focus:border-emerald-500
            "
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Nova Senha
          </label>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
            className="
              w-full rounded-xl border border-white/10 bg-white/5
              px-4 py-3 text-white outline-none focus:border-emerald-500
            "
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Confirmar Nova Senha
          </label>
          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            className="
              w-full rounded-xl border border-white/10 bg-white/5
              px-4 py-3 text-white outline-none focus:border-emerald-500
            "
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={fechar}>
            Cancelar
          </Button>

          <Button type="submit" disabled={salvando}>
            <KeyRound size={16} className="mr-2" />
            {salvando ? "Salvando..." : "Alterar Senha"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
