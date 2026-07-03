"use client";

import DashboardCard from "./DashboardCard";
import dashboard from "../../config/dashboard";

export default function StatsCard({
  title,
  value,
  subtitle = "",
  icon,
  onClick,
}) {
  return (
    <DashboardCard
      onClick={onClick}
      className={dashboard.stats.height}
    >
      <div className={dashboard.stats.container}>

        <div className={dashboard.stats.header}>

          <span className={dashboard.stats.title}>
            {title}
          </span>

          <div className={dashboard.stats.icon}>
            {icon}
          </div>

        </div>

        <h2 className={dashboard.stats.value}>
          {value}
        </h2>

        <span className={dashboard.stats.subtitle}>
          {subtitle}
        </span>

      </div>
    </DashboardCard>
  );
}