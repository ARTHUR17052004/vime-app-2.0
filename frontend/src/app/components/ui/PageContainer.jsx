"use client";

export default function PageContainer({
  children,
  className = "",
}) {
  return (
    <div
      className={`
        w-full
        max-w-[1700px]
        mx-auto
        ${className}
      `}
    >
      {children}
    </div>
  );
}