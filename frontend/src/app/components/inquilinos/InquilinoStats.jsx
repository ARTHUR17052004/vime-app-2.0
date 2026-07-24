"use client";

import StatCounter from "../common/StatCounter";

export default function InquilinoStats({
  total,
}) {
  return (
    <div className="mb-6">
      <StatCounter
        label="Total de Inquilinos"
        value={total}
      />
    </div>
  );
}