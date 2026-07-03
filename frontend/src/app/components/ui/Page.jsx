"use client";

import layout from "@/config/layout";

export default function Page({ children }) {
  return (
    <div
      className={`
        w-full
        mx-auto

        ${layout.page.maxWidth}
        ${layout.page.paddingX}
        ${layout.page.paddingY}
        ${layout.page.spacing}
      `}
    >
      {children}
    </div>
  );
}