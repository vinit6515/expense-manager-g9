"use client"

import useSWR from "swr"
import { MetricCard } from "./metric-card"
import { API_BASE, swrFetcher } from "@/lib/api"
import type { Stats } from "@/lib/types"

export function StatsGrid() {
  const { data } = useSWR<Stats>(`${API_BASE}/stats`, swrFetcher, {
    refreshInterval: 8000,
  })
  const s: Stats = data || {
    mtdIncome: 0,
    ytdIncome: 0,
    mtdInvestments: 0,
    ytdInvestments: 0,
    mtdExpenses: 0,
    ytdExpenses: 0,
  }

  const icon = (
    <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 3l4 8H8l4-8Zm0 18a5 5 0 1 0 0-10a5 5 0 0 0 0 10Z" />
      </svg>
    </div>
  )

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard title="MTD Income" subtitle="Month to Date" value={s.mtdIncome} icon={icon} />
      <MetricCard title="YTD Income" subtitle="Year to Date" value={s.ytdIncome} icon={icon} />
      <MetricCard title="MTD Investments" subtitle="Month to Date" value={s.mtdInvestments} icon={icon} tone="info" />
      <MetricCard title="YTD Investments" subtitle="Year to Date" value={s.ytdInvestments} icon={icon} tone="info" />
      <MetricCard title="MTD Expenses" subtitle="Month to Date" value={s.mtdExpenses} icon={icon} tone="danger" />
      <MetricCard title="YTD Expenses" subtitle="Year to Date" value={s.ytdExpenses} icon={icon} tone="danger" />
    </div>
  )
}
