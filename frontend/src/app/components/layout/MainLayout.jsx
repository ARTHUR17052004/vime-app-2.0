"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "./CommandPalette";

export default function MainLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* BACKGROUND */}

      <div
        className="
          fixed
          inset-0
          -z-20
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage: "url('/images/background.jpg')",
        }}
      />

      <div
        className="
          fixed
          inset-0
          -z-10
          bg-black/45
          backdrop-blur-sm
        "
      />

      {/* LAYOUT */}

      <div
        className="
          flex
          gap-0
          md:gap-8

          p-3
          md:p-6

          h-screen
        "
      >

        {/* SIDEBAR */}

        <aside
          className="
            md:w-65
            md:shrink-0
          "
        >
          <Sidebar />
        </aside>

        {/* CONTEÚDO */}

        <section
          className="
            flex
            flex-1
            flex-col
            min-w-0
          "
        >

          {/* TOPO */}

          <div className="shrink-0">
            <Topbar />
          </div>

          {/* PÁGINA */}

          <main
            className="
              flex-1
              overflow-y-auto
              pt-6
              md:pt-12
            "
          >

            <div
              className="
                w-full
                max-w-[1700px]
                mx-auto
              "
            >
              {children}
            </div>

          </main>

        </section>

      </div>

      <CommandPalette />

    </div>
  );
}