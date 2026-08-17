const dashboard = {
  /* ===========================================
      CARDS
  =========================================== */

  card: {
    radius: "rounded-[22px]",

    background:
      "bg-[var(--surface)]",

    border:
      "border border-[var(--border-token)]",

    blur:
      "backdrop-blur-md",

    shadow:
      "shadow-[0_12px_35px_rgba(0,0,0,.22)]",

    padding:
      "px-7 py-6",

    hover:
      `
      transition-all
      duration-300

      hover:border-emerald-400/15

      hover:shadow-[0_18px_42px_rgba(0,0,0,.28)]

      hover:-translate-y-[2px]
      `,
  },

  /* ===========================================
      LAYOUT
  =========================================== */

  layout: {
    maxWidth: "max-w-[1580px]",

    pagePadding: "px-8 xl:px-10",

    sectionGap: "gap-10",

    cardGap: "gap-7",

    rowGap: "gap-y-10",

    columnGap: "gap-x-7",
  },

  /* ===========================================
      HEADERS
  =========================================== */

  section: {
    title:
      "text-[28px] font-bold tracking-tight text-[var(--text)]",

    label:
      "text-[11px] uppercase tracking-[0.34em] text-[var(--text-faint)]",
  },

  /* ===========================================
      STATS
  =========================================== */

  stats: {
    height: "h-[124px]",

    container:
      "flex h-full items-center justify-between",

    content:
      "flex flex-col justify-center",

    title:
      "text-[13px] font-medium text-[var(--text-subtle)]",

    value:
      "mt-2 text-[40px] font-bold leading-none text-[var(--text)]",

    subtitle:
      "mt-2 text-[13px] text-[var(--text-faint)]",

    iconBox:
      `
      w-16
      h-16
      rounded-2xl

      flex
      items-center
      justify-center

      bg-emerald-500/10

      border
      border-emerald-500/20
      `,

    icon:
      "text-emerald-400",

    iconSize: 34,
  },

  /* ===========================================
      ANIMAÇÕES
  =========================================== */

  animation: {
    pageDelay: 0.08,

    sectionDelay: 0.12,

    cardDelay: 0.05,

    duration: 0.45,
  },
};

export default dashboard;