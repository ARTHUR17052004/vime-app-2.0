"use client";

import { useEffect, useState, useCallback } from "react";
import { NotificacaoService } from "../services/notificacao.service";
import { socket } from "../services/socket";
import { useAuth } from "../context/AuthContext";

export function useNotificacoes() {
  const { usuario } = useAuth();
  const [naoLidas, setNaoLidas] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const resposta = await NotificacaoService.listarNaoLidas();
      setNaoLidas(resposta.data || []);
    } catch (err) {
      console.error("Erro ao carregar notificações:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!usuario) return;

    carregar();

    function aoReceberNova(notificacao) {
      setNaoLidas((atual) => [notificacao, ...atual]);
    }

    socket.on("notificacao:nova", aoReceberNova);

    return () => {
      socket.off("notificacao:nova", aoReceberNova);
    };
  }, [usuario, carregar]);

  async function marcarComoLida(id) {
    setNaoLidas((atual) => atual.filter((n) => n.id !== id));

    try {
      await NotificacaoService.marcarComoLida(id);
    } catch (err) {
      console.error("Erro ao marcar como lida:", err);
      carregar();
    }
  }

  async function marcarTodasComoLidas() {
    const anteriores = naoLidas;
    setNaoLidas([]);

    try {
      await NotificacaoService.marcarTodasComoLidas();
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
      setNaoLidas(anteriores);
    }
  }

  return {
    naoLidas,
    loading,
    marcarComoLida,
    marcarTodasComoLidas,
    recarregar: carregar,
  };
}