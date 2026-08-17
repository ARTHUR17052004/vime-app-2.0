"use client";

export default function PageHeader({
  title,
  subtitle,
  children,
}) {
  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-6
        mb-8
      "
    >
      <div>

        <h1
          className="
            text-6xl
            font-black
            tracking-tight
            text-[var(--text)]
          "
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="
              mt-2
              text-2xl
              text-[var(--text-muted)]
            "
          >
            {subtitle}
          </p>
        )}

      </div>

      {children && (
        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          {children}
        </div>
      )}
    </div>
  );
}