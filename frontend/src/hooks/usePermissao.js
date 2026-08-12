"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { PerfilService } from "@/services/perfis.service";

export function usePermissao(chave) {

  const { usuario } = useAuth();

  const [permitido, setPermitido] = useState(false);

  useEffect(() => {

    async function verificar() {

      if (!usuario) {
        setPermitido(false);
        return;
      }

      if (usuario.perfil === "ADMINISTRADOR") {
        setPermitido(true);
        return;
      }

      try {

        const resposta = await PerfilService.listar();

        const perfis = Array.isArray(resposta)
          ? resposta
          : resposta.data || [];

        const meuPerfil = perfis.find(
          (p) => p.nome === usuario.perfil
        );

        setPermitido(
          Boolean(
            meuPerfil?.permissoes?.includes(chave)
          )
        );

      } catch (err) {

        console.error("Erro ao verificar permissão:", err);

      }

    }

    verificar();

  }, [usuario, chave]);

  return permitido;

}
