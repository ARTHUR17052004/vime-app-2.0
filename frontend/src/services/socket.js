import { io } from "socket.io-client";
import { API_URL } from "../config/api";

export const socket = io(API_URL, {
  // Começa por polling e sobe pra websocket quando o servidor deixar (se o
  // proxy não repassar o upgrade, continua em polling em vez de ficar sem
  // tempo real -- e sem tempo real não tem som no ato da notificação).
  transports: ["polling", "websocket"],
  autoConnect: true,
  withCredentials: true,
  // Token da GUIA (não o cookie, que é um só pro navegador todo): assim cada
  // guia entra no tempo real com o usuário dela.
  auth: (cb) => cb({ token: typeof window !== "undefined" ? sessionStorage.getItem("token") : null }),
});