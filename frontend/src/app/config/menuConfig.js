import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  UserSquare2,
  FileText,
  ClipboardList,
  ShieldCheck,
  Wallet,
  Receipt,
  Bell,
  FileBarChart2,
  Bot,
  Settings,
  BadgeDollarSign,
} from "lucide-react";

const menuConfig = [
  {
    title: "Menu",
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "Imóveis",
    items: [
      {
        label: "Residências",
        href: "/unidades",
        icon: Building2,
      },
      {
        label: "Kitnets",
        href: "/kitnets",
        icon: Home,
      },
      {
        label: "Locadores",
        href: "/locadores",
        icon: UserSquare2,
      },
      {
        label: "Inquilinos",
        href: "/inquilinos",
        icon: Users,
      },
    ],
  },

  {
    title: "Operação",
    items: [
      {
        label: "Contratos",
        href: "/contratos",
        icon: FileText,
      },
      {
        label: "Solicitações",
        href: "/solicitacoes",
        icon: ClipboardList,
      },
      {
        label: "Vistorias",
        href: "/vistorias",
        icon: ShieldCheck,
      },
    ],
  },

  {
    title: "Financeiro",
    items: [
      {
        label: "Financeiro",
        href: "/financeiro",
        icon: Wallet,
      },
      {
        label: "Relatórios",
        href: "/relatorios",
        icon: FileBarChart2,
      },
      {
        label: "Asaas Config",
        href: "/asaas-config",
        icon: BadgeDollarSign,
      },
      {
        label: "Asaas Transações",
        href: "/asaas-transacoes",
        icon: Receipt,
      },
    ],
  },

  {
    title: "Integrações",
    items: [
      {
        label: "Clicksign",
        href: "/clicksign",
        icon: FileText,
        badge: "Novo",
      },
      {
        label: "WhatsApp IA",
        href: "/whatsapp",
        icon: Bot,
        badge: "IA",
      },
    ],
  },

  {
    title: "Administração",
    items: [
      {
        label: "Administração",
        href: "/administracao",
        icon: ShieldCheck,
      },
    ],
  },

  {
    title: "Sistema",
    items: [
      {
        label: "Notificações",
        href: "/notificacoes",
        icon: Bell,
      },
      {
        label: "Configurações",
        href: "/configuracoes",
        icon: Settings,
      },
    ],
  },
];

export default menuConfig;