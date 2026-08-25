"use client";

import LoginBackground from "../components/auth/LoginBackground";
import LoginCard from "../components/auth/LoginCard";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <LoginBackground />

      <div className="relative z-10 h-screen overflow-y-auto">
        <section
          className="
            flex
            items-center
            justify-center

            min-h-full

            px-6
            py-12
          "
        >
          <LoginCard />
        </section>
      </div>
    </main>
  );
}