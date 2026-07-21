"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";

import Button from "../ui/Button";
import LoginInput from "./LoginInput";

import { api } from "../../../services/api";

export default function LoginForm() {

  const router = useRouter();

  const [email, setEmail] = useState("admin@vime.com");
  const [senha, setSenha] = useState("123456");

  const [lembrar, setLembrar] = useState(true);

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

      if (lembrar) {

        localStorage.setItem(
          "vime-remember",
          "true"
        );

      }

      router.push("/");

    } catch (err) {

      setErro(
        err.message || "Não foi possível entrar."
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <form
      onSubmit={fazerLogin}
      className="space-y-6"
    >

      {erro && (

        <div
          className="
            rounded-2xl

            border
            border-red-500/20

            bg-red-500/10

            px-4
            py-3

            text-sm

            text-red-300
          "
        >

          {erro}

        </div>

      )}

      <LoginInput

        label="E-mail"

        type="email"

        icon={<Mail size={20} />}

        placeholder="Digite seu e-mail"

        value={email}

        onChange={(e) =>
          setEmail(e.target.value)
        }

      />

      <LoginInput

        label="Senha"

        type="password"

        icon={<Lock size={20} />}

        placeholder="Digite sua senha"

        value={senha}

        onChange={(e) =>
          setSenha(e.target.value)
        }

      />

      <div
        className="
          flex
          items-center
          justify-between

          text-sm
        "
      >

        <label
          className="
            flex
            items-center
            gap-2

            text-gray-300

            cursor-pointer
          "
        >

          <input

            type="checkbox"

            checked={lembrar}

            onChange={(e)=>
              setLembrar(e.target.checked)
            }

            className="
              w-4
              h-4

              accent-emerald-500
            "

          />

          Lembrar-me

        </label>

        <button

          type="button"

          className="
            text-emerald-400

            hover:text-emerald-300

            transition
          "
        >

          Esqueceu a senha?

        </button>

      </div>

      <Button

        login  

        type="submit"

        loading={loading}

        className="
          w-full

          h-14

          rounded-2xl

          text-lg
          font-semibold
        "

      >

        Entrar

      </Button>

    </form>

  );

}