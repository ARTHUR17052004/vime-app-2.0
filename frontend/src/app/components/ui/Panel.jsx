"use client";

import Card from "./Card";

export default function Panel({
  label,
  title,
  subtitle,
  icon,
  action,
  footer,
  children,

  className = "",
  headerClassName = "",
  contentClassName = "",
  footerClassName = "",
}) {
  return (
    <Card
      className={`
        h-full
        flex
        flex-col

        ${className}
      `}
    >
      {(label || title || subtitle || icon || action) && (

        <header
          className={`
            flex
            items-center
            justify-between

            gap-10

            pb-8
            mb-8

            border-b
            border-white/[0.05]

            ${headerClassName}
          `}
        >
          {/* ESQUERDA */}

          <div
            className="
              flex
              items-center
              gap-6

              flex-1
            "
          >
            {icon && (

              <div
                className="
                  w-14
                  h-14

                  rounded-2xl

                  flex
                  items-center
                  justify-center

                  bg-emerald-500/10

                  border
                  border-emerald-500/20

                  text-emerald-400

                  shrink-0
                "
              >
                {icon}
              </div>

            )}

            <div
              className="
                flex
                flex-col
                justify-center
              "
            >
              {label && (

                <span
                  className="
                    text-[11px]
                    uppercase
                    tracking-[0.34em]
                    text-gray-500

                    mb-2
                  "
                >
                  {label}
                </span>

              )}

              {title && (

                <h2
                  className="
                    text-[34px]
                    font-bold
                    leading-tight
                    text-white
                  "
                >
                  {title}
                </h2>

              )}

              {subtitle && (

                <p
                  className="
                    mt-2
                    text-[14px]
                    text-gray-400
                  "
                >
                  {subtitle}
                </p>

              )}

            </div>

          </div>

          {/* DIREITA */}

          {action && (

            <div
              className="
                shrink-0

                flex
                items-center
                gap-4
              "
            >
              {action}
            </div>

          )}

        </header>

      )}

      {/* CONTEÚDO */}

      <section
        className={`
          flex-1

          flex
          flex-col

          gap-8

          ${contentClassName}
        `}
      >
        {children}
      </section>

      {/* FOOTER */}

      {footer && (

        <footer
          className={`
            mt-8
            pt-6

            border-t
            border-white/[0.05]

            ${footerClassName}
          `}
        >
          {footer}
        </footer>

      )}

    </Card>
  );
}