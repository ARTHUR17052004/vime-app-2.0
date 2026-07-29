"use client";

export default function PageActions({
  children,
  className = "",
}) {
  return (
    <div
      className={`
        flex
        flex-col
        lg:flex-row
        lg:items-center
        lg:justify-between
        gap-4
        mb-8
        ${className}
      `}
    >
      {children}
    </div>
  );
}