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

// `permissao` é a chave conferida contra usuario.permissoes (ver
// Sidebar.jsx) -- item sem `permissao` fica sempre visível. Quando
// tem mais de uma chave aceitável, usa `permissoes` (array, basta ter
// uma delas).
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
        permissao: "unidades.visualizar",
      },
      {
        label: "Kitnets",
        href: "/kitnets",
        icon: Home,
        permissao: "kitnets.visualizar",
      },
      {
        label: "Locadores",
        href: "/locadores",
        icon: UserSquare2,
        permissao: "locadores.visualizar",
      },
      {
        label: "Inquilinos",
        href: "/inquilinos",
        icon: Users,
        permissao: "inquilinos.visualizar",
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
        permissao: "contratos.visualizar",
      },
      {
        label: "Solicitações",
        href: "/solicitacoes",
        icon: ClipboardList,
        permissao: "solicitacoes.visualizar",
      },
      {
        label: "Vistorias",
        href: "/vistorias",
        icon: ShieldCheck,
        permissao: "vistorias.visualizar",
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
        permissao: "financeiro.visualizar",
      },
      {
        label: "Relatórios",
        href: "/relatorios",
        icon: FileBarChart2,
        permissao: "relatorios.visualizar",
      },
      {
        label: "Asaas Config",
        href: "/asaas-config",
        icon: BadgeDollarSign,
        permissao: "financeiro.visualizar",
      },
      {
        label: "Asaas Transações",
        href: "/asaas-transacoes",
        icon: Receipt,
        permissao: "financeiro.visualizar",
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
        permissao: "contratos.visualizar",
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
        permissoes: ["usuarios.visualizar", "perfis.visualizar", "permissoes.visualizar", "auditoria.visualizar", "logs.visualizar"],
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
        permissao: "configuracoes.visualizar",
      },
    ],
  },
];

export default menuConfig;
