"use client";

import { useEffect, useState, useCallback } from "react";
import { NotificacaoService } from "../services/notificacao.service";
import { socket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { tocarSomNotificacao } from "../utils/somNotificacao";

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
      tocarSomNotificacao();
    }

    // Push que chegou com o app aberto: o service worker não mostra a
    // notificação do sistema (ver public/sw.js) e avisa a página, que
    // recarrega a lista e toca o som -- garante o aviso mesmo se o
    // socket tiver caído.
    function aoMensagemDoServiceWorker(evento) {
      if (evento.data?.tipo === "push-recebido") {
        carregar();
        tocarSomNotificacao();
      }
    }

    socket.on("notificacao:nova", aoReceberNova);
    navigator.serviceWorker?.addEventListener("message", aoMensagemDoServiceWorker);

    return () => {
      socket.off("notificacao:nova", aoReceberNova);
      navigator.serviceWorker?.removeEventListener("message", aoMensagemDoServiceWorker);
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