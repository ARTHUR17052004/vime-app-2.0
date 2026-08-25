"use client";

import { dashboard } from "@/theme/dashboardTheme";

const layouts = {
  1: "grid-cols-1",

  2: "grid-cols-1 lg:grid-cols-2",

  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",

  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",

  5: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-5",

  "8-4": "grid-cols-12",

  "7-5": "grid-cols-12",

  "6-6": "grid-cols-12",

  "5-7": "grid-cols-12",

  "3-9": "grid-cols-12",
};

const alignments = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

export default function PageGrid({
  children,
  cols,
  layout,
  className = "",
  align = "stretch",
}) {
  const gridClass =
    layouts[layout] ||
    layouts[cols] ||
    layouts[1];

  return (
    <section
      className={`
        grid
        w-full

        ${gridClass}

        ${alignments[align]}

        ${className}
      `}
      style={{
        gap: `${dashboard.cardSpacing}px`,
      }}
    >
      {children}
    </section>
  );
}