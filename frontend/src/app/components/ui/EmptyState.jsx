"use client";

import { Inbox } from "lucide-react";

import FadeIn from "./FadeIn";
import Button from "./Button";

export default function EmptyState({
  icon,

  title = "Nenhum registro encontrado",

  description = "Ainda não existem informações para exibir.",

  action,

  actionLabel,
}) {

  return (

    <FadeIn>

      <div

        className="

          rounded-3xl

          border
          border-[var(--border-token)]

          bg-[var(--surface)]

          backdrop-blur-xl

          shadow-[0_8px_20px_rgba(0,0,0,.18)]

          py-20
          px-10

          flex
          flex-col
          items-center
          justify-center

          text-center

        "

      >

        <div

          className="

            flex
            items-center
            justify-center

            w-24
            h-24

            rounded-full

            bg-emerald-500/10

            border
            border-emerald-500/20

            text-emerald-400

          "

        >

          {icon || <Inbox size={48} />}

        </div>

        <h2

          className="

            mt-8

            text-3xl

            font-bold

            text-[var(--text)]

          "

        >

          {title}

        </h2>

        <p

          className="

            mt-4

            max-w-xl

            leading-7

            text-[var(--text-subtle)]

          "

        >

          {description}

        </p>

        {action && (

          <div className="mt-10">

            <Button
              onClick={action}
            >

              {actionLabel || "Adicionar"}

            </Button>

          </div>

        )}

      </div>

    </FadeIn>

  );

}