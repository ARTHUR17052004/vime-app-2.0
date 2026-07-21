"use client";

export default function Button({

  children,

  onClick,

  type = "button",

  variant = "primary",

  size = "md",

  fullWidth = false,

  disabled = false,

  loading = false,

  leftIcon,

  rightIcon,

  login = false,

  className = "",

}) {
  const variants = {

    primary: `
      bg-emerald-600
      hover:bg-emerald-500
      text-white

      border
      border-emerald-500/30

      shadow-lg
      shadow-emerald-950/40
    `,

    secondary: `
      bg-white/5
      hover:bg-white/10

      border
      border-white/10

      text-white
    `,

    danger: `
      bg-red-600
      hover:bg-red-500

      border
      border-red-500/30

      text-white
    `,

    warning: `
      bg-yellow-500
      hover:bg-yellow-400

      border
      border-yellow-400/30

      text-black
    `,

    info: `
      bg-sky-600
      hover:bg-sky-500

      border
      border-sky-500/30

      text-white
    `,

    ghost: `
      bg-transparent

      hover:bg-white/5

      border
      border-white/10

      text-gray-300
    `,
  };

  const sizes = {

    sm: `
      h-10
      px-4

      text-sm
    `,

    md: `
      h-11
      px-5

      text-sm
    `,

    lg: `
      h-12
      px-6

      text-base
    `,
  };

  return (

    <button

      type={type}

      onClick={onClick}

      disabled={disabled || loading}

      className={`
        inline-flex
        items-center
        justify-center
        gap-2

        transition-all
        duration-300

        font-semibold

        ${
          login
            ? `
              h-14
              w-full

              rounded-2xl

              bg-linear-to-r
              from-emerald-500
              to-emerald-600

              hover:from-emerald-400
              hover:to-emerald-500

              text-white

              shadow-lg
              shadow-emerald-500/20
            `
            : `
              rounded-xl

              ${variants[variant]}

              ${sizes[size]}
            `
        }

        ${
          fullWidth ? "w-full" : ""
        }

        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : ""
        }

        ${className}
    `}
    >

      {loading ? (

        <>

          <span className="animate-spin">
            ⏳
          </span>

          Carregando...

        </>

      ) : (

        <>

          {leftIcon}

          {children}

          {rightIcon}

        </>

      )}

    </button>

  );

}