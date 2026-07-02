"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Input from "../ui/Input";
import Button from "../ui/Button";

import { api } from "../../../services/api";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@vime.com");
  const [senha, setSenha] = useState("123456");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function fazerLogin(e) {
    e.preventDefault();

    setErro("");
    setLoading(true);

    try {
      const response = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          senha,
        }),
      });

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "usuario",
        JSON.stringify(response.data.usuario)
      );

      router.push("/");
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={fazerLogin}
      className="space-y-5"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">
          Entrar
        </h2>

        <p className="text-green-300 mt-2">
          Acesse sua conta
        </p>
      </div>

      {erro && (
        <div className="rounded-xl bg-red-500/20 border border-red-500 p-3 text-red-200">
          {erro}
        </div>
      )}

      <Input
        label="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        label="Senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <Button
        type="submit"
        className="w-full"
      >
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}