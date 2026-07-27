"use client";

import { dashboard } from "@/theme/dashboardTheme";

export default function PageSection({
  children,
  spacing = "normal",
  className = "",
}) {

  const spaces = {
    none: 0,
    sm: dashboard.cardSpacing * 0.5,
    normal: dashboard.sectionSpacing * 0.75,
    lg: dashboard.sectionSpacing,
    xl: dashboard.sectionSpacing * 1.2,
    xxl: dashboard.sectionSpacing * 1.5,
  };

  return (
    <section
      className={`
        relative
        w-full
        ${className}
      `}
      style={{
        marginBottom: `${spaces[spacing]}px`,
      }}
    >
      {children}
    </section>
  );
}