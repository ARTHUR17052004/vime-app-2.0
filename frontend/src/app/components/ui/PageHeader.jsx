"use client";

import FadeIn from "./FadeIn";

export default function PageHeader({
  title,
  subtitle,
  actions,
  badge,
}) {
  return (

    <FadeIn>

      <section className="mb-10">

        <div className="flex items-end justify-between gap-8">

          {/* ESQUERDA */}

          <div>

            {badge && (

              <p
                className="
                  mb-3

                  text-[11px]

                  uppercase

                  tracking-[0.40em]

                  font-semibold

                  text-emerald-400
                "
              >
                {badge}
              </p>

            )}

            <h1
              className="
                text-4xl
                xl:text-5xl

                font-black

                tracking-tight

                leading-none

                text-white
              "
            >
              {title}
            </h1>

            {subtitle && (

              <p
                className="
                  mt-4

                  max-w-3xl

                  text-base

                  leading-7

                  text-gray-400
                "
              >
                {subtitle}
              </p>

            )}

          </div>

          {/* DIREITA */}

          {actions && (

            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              {actions}
            </div>

          )}

        </div>

      </section>

    </FadeIn>

  );
}