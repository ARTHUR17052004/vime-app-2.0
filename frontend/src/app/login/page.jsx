"use client";

import LoginBackground from "../components/auth/LoginBackground";
import LoginCard from "../components/auth/LoginCard";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <LoginBackground />

      <section
        className="
          relative
          z-10

          flex
          items-center
          justify-center

          min-h-screen

          px-6
          py-12
        "
      >
        <LoginCard />
      </section>
    </main>
  );
}