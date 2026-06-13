"use client";

import Link from "next/link";

export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", href: "/" },
    { name: "Unidades", href: "/unidades" },
    { name: "Kitnets", href: "/kitnets" },
    { name: "Inquilinos", href: "/inquilinos" },
    { name: "Solicitações", href: "/solicitacoes" },
    { name: "Vistorias", href: "/vistorias" },
    { name: "Contratos", href: "/contratos" },
    { name: "Financeiro", href: "/financeiro" },
    { name: "Relatórios", href: "/relatorios" },
    { name: "Avisos", href: "/avisos" },
    { name: "Notificações", href: "/notificacoes" },
    { name: "Segurança & Auditoria", href: "/seguranca" },
    { name: "Automações", href: "/automacoes" },
    { name: "Revisão Sistema", href: "/revisao" },
    { name: "Locadores", href: "/locadores" },
    { name: "Usuários", href: "/usuarios" },
    { name: "Asaas Config", href: "/asaas-config" },
    { name: "Asaas Transações", href: "/asaas-transacoes" },
    { name: "Asaas Repasses", href: "/asaas-repasses" },
    { name: "Clicksign Config", href: "/clicksign" },
    { name: "WhatsApp & IA", href: "/whatsapp" },
    { name: "Configurações", href: "/configuracoes" },
  ];

  return (
    <aside className="w-72 bg-green-900 text-white flex flex-col h-screen">
      <div className="p-6 border-b border-green-800">
        <h1 className="text-3xl font-bold">
          VIME
        </h1>

        <p className="text-green-200 text-sm mt-1">
          Gestão Inteligente
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="block px-6 py-3 text-sm hover:bg-green-800 transition"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-green-800 p-4">
        <div className="bg-green-800 rounded-xl p-3">
          <p className="font-medium">
            Arthur
          </p>

          <p className="text-xs text-green-200">
            Administrador
          </p>
        </div>
      </div>
    </aside>
  );
}