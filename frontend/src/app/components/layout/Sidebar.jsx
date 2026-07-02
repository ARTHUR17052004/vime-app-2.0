"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import menuConfig from "../../config/menuConfig";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        relative
        flex
        flex-col

        w-80

        bg-[#0F172A]/95
        backdrop-blur-xl

        border-r
        border-white/10

        text-white

        h-screen

        overflow-hidden
      "
    >
      {/* ========================= */}
      {/* LOGO */}
      {/* ========================= */}

      <div className="h-24 px-8 flex items-center justify-between border-b border-white/10">

        <div>

          <h1 className="text-3xl font-black tracking-wide">
            VIME
          </h1>

          <p className="text-xs uppercase tracking-[0.30em] text-green-400 mt-1">
            Property Management
          </p>

        </div>

        <button
          className="
            w-10
            h-10
            rounded-xl

            bg-white/5

            hover:bg-white/10

            transition
          "
        >
          <ChevronLeft size={18} />
        </button>

      </div>

      {/* ========================= */}
      {/* MENU */}
      {/* ========================= */}

      <div
        className="
          flex-1

          overflow-y-auto

          px-5

          py-6

          space-y-8
        "
      >

        {menuConfig.map((section) => (

          <div key={section.title}>

            <p
              className="
                text-[11px]

                uppercase

                tracking-[0.25em]

                text-gray-500

                mb-4

                px-3
              "
            >
              {section.title}
            </p>

            <div className="space-y-1">

              {section.items.map((item) => {

                const Icon = item.icon;

                const active = pathname === item.href;

                return (

                  <Link
                    key={item.label}
                    href={item.href}
                    className={`
                      group

                      flex

                      items-center

                      justify-between

                      rounded-2xl

                      px-4

                      py-3

                      transition-all

                      duration-300

                      ${
                        active
                          ? "bg-green-600 shadow-lg shadow-green-900/40"
                          : "hover:bg-white/5"
                      }
                    `}
                  >

                    <div className="flex items-center gap-4">

                      <Icon
                        size={19}
                        className={`
                          ${
                            active
                              ? "text-white"
                              : "text-gray-400 group-hover:text-green-400"
                          }
                        `}
                      />

                      <span
                        className={`
                          text-sm

                          font-medium

                          ${
                            active
                              ? "text-white"
                              : "text-gray-300"
                          }
                        `}
                      >
                        {item.label}
                      </span>

                    </div>

                    {item.badge && (

                      <span
                        className="
                          px-2.5

                          py-1

                          rounded-full

                          text-[11px]

                          font-semibold

                          bg-green-500

                          text-white
                        "
                      >
                        {item.badge}
                      </span>

                    )}

                  </Link>

                );

              })}

            </div>

          </div>

        ))}

      </div>

      {/* ========================= */}
      {/* FOOTER */}
      {/* ========================= */}

      <div
        className="
          border-t

          border-white/10

          p-5
        "
      >

        <div
          className="
            rounded-2xl

            bg-white/5

            p-4

            border

            border-white/10
          "
        >

          <div className="flex items-center gap-4">

            <div
              className="
                w-12

                h-12

                rounded-full

                bg-gradient-to-br

                from-green-500

                to-emerald-700

                flex

                items-center

                justify-center

                font-bold
              "
            >
              A
            </div>

            <div>

              <p className="font-semibold">
                Arthur
              </p>

              <p className="text-xs text-green-400">
                Administrador
              </p>

            </div>

          </div>

        </div>

      </div>

    </aside>
  );
}