// ===============================
// VIME 2.0 DESIGN SYSTEM
// ===============================

const layout = {

  // ==========================
  // PÁGINA
  // ==========================

  page: {
    maxWidth: "max-w-[1700px]",

    paddingX: "px-6 md:px-8 xl:px-10 2xl:px-12",

    paddingY: "py-8",

    spacing: "space-y-10",
  },

  // ==========================
  // GRID
  // ==========================

  grid: {
    cols1: "grid-cols-1",

    cols2: "grid-cols-1 md:grid-cols-2",

    cols3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",

    cols4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",

    cols12: "grid-cols-12",

    gapXS: "gap-2",

    gapSM: "gap-4",

    gapMD: "gap-6",

    gapLG: "gap-8",

    gapXL: "gap-10",

    gap2XL: "gap-12",

    gap3XL: "gap-16",

    align: "items-start",
  },

  // ==========================
  // CARD
  // ==========================

  card: {

    radius: "rounded-3xl",

    paddingSM: "p-4",

    paddingMD: "p-6",

    paddingLG: "p-7",

    paddingXL: "p-8",

    border: "border border-white/10",

    shadow: "shadow-[0_10px_35px_rgba(0,0,0,.22)]",

    hover: `
      transition-all
      duration-300
      hover:-translate-y-[3px]
      hover:border-emerald-400/25
      hover:shadow-[0_14px_45px_rgba(16,185,129,.14)]
    `,
  },

  // ==========================
  // SIDEBAR
  // ==========================

  sidebar: {

    width: "w-[260px]",

    collapsed: "w-20",

    padding: "px-5",

    sectionSpacing: "space-y-7",
  },

  // ==========================
  // TOPBAR
  // ==========================

  topbar: {

    height: "h-16",

    padding: "px-8",

    radius: "rounded-3xl",
  },

  // ==========================
  // BOTÕES
  // ==========================

  button: {

    radius: "rounded-xl",

    padding: "px-4 py-2",
  },

  // ==========================
  // MODAIS
  // ==========================

  modal: {

    radius: "rounded-3xl",

    padding: "p-8",
  },

  // ==========================
  // TABELAS
  // ==========================

  table: {

    radius: "rounded-2xl",

    padding: "p-6",
  },

};

export default layout;