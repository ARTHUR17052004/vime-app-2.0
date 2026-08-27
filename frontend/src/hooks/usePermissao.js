"use client";

import { useAuth } from "@/context/AuthContext";

// usuario.permissoes já vem completo no login (ver authService.js no
// backend) e fica salvo no localStorage -- não precisa buscar de novo
// a cada checagem. ADMINISTRADOR sempre pode tudo, igual à regra do
// backend (permissaoMiddleware).
export function usePermissao(chave) {

  const { usuario } = useAuth();

  if (!usuario) return false;

  if (usuario.perfil === "ADMINISTRADOR") return true;

  return Boolean(usuario.permissoes?.includes(chave));

}

// Pra quando o componente precisa checar várias permissões de uma vez
// (ex.: uma tabela que decide mostrar "Editar" e "Excluir" no menu de
// ações) -- evita repetir a leitura do usuário pra cada uma.
export function usePermissoes() {

  const { usuario } = useAuth();

  function pode(chave) {

    if (!usuario) return false;

    if (usuario.perfil === "ADMINISTRADOR") return true;

    return Boolean(usuario.permissoes?.includes(chave));

  }

  return { usuario, pode };

}
