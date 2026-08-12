"use client";

import { motion } from "framer-motion";

export default function AdministracaoCard({

  title,

  subtitle,

  icon: Icon,

  value,

  color = "emerald",

  children,

}) {

  const colors = {

    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: "text-emerald-400",
    },

    blue: {
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      icon: "text-sky-400",
    },

    yellow: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      icon: "text-yellow-400",
    },

    red: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      icon: "text-red-400",
    },

    purple: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      icon: "text-violet-400",
    },

  };

  const theme = colors[color] || colors.emerald;

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 15,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      transition={{
        duration: .30,
      }}

      className="
        rounded-3xl
        border
        border-white/10
        bg-[#19242b]/90
        backdrop-blur-xl
        shadow-xl
        p-6
        transition-all
        hover:border-emerald-500/30
        hover:-translate-y-1
        hover:shadow-2xl
      "
    >

      <div className="flex items-start justify-between">

        <div>

          <h3
            className="
              text-lg
              font-bold
              text-white
            "
          >
            {title}
          </h3>

          {subtitle && (

            <p
              className="
                mt-1
                text-sm
                text-gray-400
              "
            >
              {subtitle}
            </p>

          )}

        </div>

        {Icon && (

          <div
            className={`
              w-14
              h-14

              rounded-2xl

              flex
              items-center
              justify-center

              ${theme.bg}
              ${theme.border}

              border
            `}
          >

            <Icon

              size={28}

              className={theme.icon}

            />

          </div>

        )}

      </div>

      {value !== undefined && (

        <div
          className="
            mt-6

            text-4xl
            font-black
            text-white
          "
        >
          {value}
        </div>

      )}

      {children && (

        <div className="mt-6">

          {children}

        </div>

      )}

    </motion.div>

  );

}