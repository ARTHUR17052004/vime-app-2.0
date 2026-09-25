"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Fingerprint } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import Button from "../ui/Button";
import LoginInput from "./LoginInput";

import { api } from "../../../services/api";
import { BiometriaService } from "../../../services/biometria.service";

export default function LoginForm() {

  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [lembrar, setLembrar] = useState(true);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [biometriaDisponivel, setBiometriaDisponivel] = useState(false);
  const jaTentouAutomatico = useRef(false);

  // Aparelho que já cadastrou a digital: mostra o botão e já pede a digital
  // ao abrir, como os outros apps.
  useEffect(() => {

    let ativo = true;

    BiometriaService.suportado().then((ok) => {

      if (!ativo || !ok || !BiometriaService.aparelhoCadastrado()) return;

      setBiometriaDisponivel(true);

      if (!jaTentouAutomatico.current) {
        jaTentouAutomatico.current = true;
        entrarComDigital(true);
      }

    });

    return () => { ativo = false; };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function entrarComDigital(automatico = false) {

    setErro("");
    setLoading(true);

    try {

      const dados = await BiometriaService.entrar();

      login(dados.token, dados.usuario);

      router.replace("/");

    } catch (err) {

      // Fechar/cancelar o pedido logo ao abrir não precisa de aviso.
      if (!automatico) setErro(err.message || "Não foi possível entrar com a digital.");

    } finally {

      setLoading(false);

    }

  }

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

      login(
        response.data.token,
        response.data.usuario
      );

      if (lembrar) {
        localStorage.setItem(
          "vime-remember",
          "true"
        );
      }

      router.replace("/");

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
      autoComplete="off"
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

        autoComplete="off"

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

        autoComplete="new-password"

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

          onClick={() => router.push("/esqueci-senha")}

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

      {biometriaDisponivel && (

        <button
          type="button"
          onClick={() => entrarComDigital(false)}
          disabled={loading}
          className="
            w-full
            h-14

            flex
            items-center
            justify-center
            gap-3

            rounded-2xl

            border
            border-emerald-500/40

            text-emerald-300
            font-semibold

            hover:bg-emerald-500/10

            transition

            disabled:opacity-50
          "
        >

          <Fingerprint size={22} />

          Entrar com digital

        </button>

      )}

    </form>

  );

}