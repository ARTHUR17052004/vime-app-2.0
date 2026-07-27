"use client";

export default function StatCounter({
  total = 0,
  label = "registro(s)",
}) {
  return (
    <p
      className="
        mt-1

        text-sm

        font-semibold

        text-emerald-400

        tracking-wide
      "
    >
      {total} {label}
    </p>
  );
}