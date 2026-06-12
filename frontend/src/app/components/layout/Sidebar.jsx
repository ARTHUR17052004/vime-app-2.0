"use client";

import Link from "next/link";

export default function Sidebar() {
  const menuItems = [
    "Dashboard",
    "Unidades",
    "Kitnets",
    "Inquilinos",
    "Solicitações",
    "Vistorias",
    "Contratos",
    "Financeiro",
    "Relatórios",
    "Avisos",
    "Notificações",
    "Segurança & Auditoria",
    "Automações",
    "Revisão Sistema",
    "Locadores",
    "Usuários",
    "Asaas Config",
    "Asaas Transações",
    "Asaas Repasses",
    "Clicksign Config",
    "WhatsApp & IA",
    "Configurações",
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
            key={item}
            href="#"
            className="block px-6 py-3 text-sm hover:bg-green-800 transition"
          >
            {item}
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