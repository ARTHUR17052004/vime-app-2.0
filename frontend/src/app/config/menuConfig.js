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
  LifeBuoy,
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
    // Ordem segue a sequência real de cadastro: precisa de um Locador
    // antes de criar a Residência dele, a Residência já gera as
    // Kitnets, e só com a Kitnet disponível dá pra cadastrar o
    // Inquilino nela.
    title: "Imóveis",
    items: [
      {
        label: "Locadores",
        href: "/locadores",
        icon: UserSquare2,
        permissao: "locadores.visualizar",
      },
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
        permissao: "asaasConfig.visualizar",
      },
      {
        label: "Asaas Transações",
        href: "/asaas-transacoes",
        icon: Receipt,
        permissao: "asaasTransacoes.visualizar",
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
        permissao: "clicksign.visualizar",
      },
      {
        label: "WhatsApp IA",
        href: "/whatsapp",
        icon: Bot,
        badge: "IA",
        permissao: "whatsapp.visualizar",
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
        label: "Suporte Técnico",
        href: "/suporte",
        icon: LifeBuoy,
        permissao: "suporte.visualizar",
      },
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
