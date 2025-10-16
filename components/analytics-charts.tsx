"use client"

import useSWR from "swr"
import { API_BASE, swrFetcher, buildQuery } from "@/lib/api"
import type { AnalyticsBreakdown, AnalyticsTimeseriesPoint } from "@/lib/types"
import { useMemo, useState } from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

type RangeKey = "30d" | "90d" | "mtd" | "ytd"

function getRangeDates(key: RangeKey) {
  const now = new Date()
  const end = new Date(now.toISOString())
  let start = new Date(now.toISOString())
  if (key === "30d") {
    start.setDate(start.getDate() - 30)
  } else if (key === "90d") {
    start.setDate(start.getDate() - 90)
  } else if (key === "mtd") {
    start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  } else if (key === "ytd") {
    start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
  }
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

export function AnalyticsCharts() {
  const [range, setRange] = useState<RangeKey>("30d")
  const [showAllTags, setShowAllTags] = useState(false)

  const { start, end } = useMemo(() => getRangeDates(range), [range])

  const analyticsKey = `${API_BASE}/analytics?${buildQuery({ start, end })}`
  const seriesKey = `${API_BASE}/analytics/timeseries?${buildQuery({ start, end })}`

  const { data: breakdown, isLoading: loadingBreakdown } = useSWR<AnalyticsBreakdown>(analyticsKey, swrFetcher, {
    refreshInterval: 12000,
  })
  const { data: series, isLoading: loadingSeries } = useSWR<AnalyticsTimeseriesPoint[]>(seriesKey, swrFetcher, {
    refreshInterval: 12000,
  })

  const isLoading = loadingBreakdown || loadingSeries

  const byCategory = breakdown?.byCategory ?? []
  const byPaymentMode = breakdown?.byPaymentMode ?? []
  const byTagRaw = breakdown?.byTag ?? []
  const byTag = showAllTags ? byTagRaw : byTagRaw.slice(0, 10)

  const totalCategory = byCategory.reduce((s, x) => s + (x.total || 0), 0)
  const totalPaymentMode = byPaymentMode.reduce((s, x) => s + (x.total || 0), 0)
  const totalTags = byTag.reduce((s, x) => s + (x.total || 0), 0)

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-foreground">Time Range:</span>
            <div className="flex gap-2 flex-wrap">
              {(["30d", "90d", "mtd", "ytd"] as RangeKey[]).map((key) => (
                <Button
                  key={key}
                  size="sm"
                  variant={range === key ? "default" : "outline"}
                  onClick={() => setRange(key)}
                  aria-pressed={range === key}
                  className="transition-all"
                >
                  {key === "30d"
                    ? "Last 30 Days"
                    : key === "90d"
                      ? "Last 90 Days"
                      : key === "mtd"
                        ? "This Month"
                        : "This Year"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending Trend Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Spending Trend</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Daily expense breakdown over selected period</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Three Column Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category breakdown */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Spending by Category</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Total: ₹{totalCategory.toFixed(2)}</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[320px] w-full rounded-lg" />
            ) : byCategory.length > 0 ? (
              <ChartContainer config={{}} className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="total"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      label={(entry: any) => {
                        const pct = totalCategory ? Math.round((entry.total / totalCategory) * 100) : 0
                        return `${pct}%`
                      }}
                      labelLine={false}
                    >
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          const data = payload[0].payload
                          const pct = totalCategory ? Math.round((data.total / totalCategory) * 100) : 0
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold text-sm">{data.name}</p>
                              <p className="text-sm text-muted-foreground">₹{data.total.toFixed(2)}</p>
                              <p className="text-xs text-chart-1 font-medium">{pct}%</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Payment mode breakdown */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Spending by Payment Mode</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Total: ₹{totalPaymentMode.toFixed(2)}</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[320px] w-full rounded-lg" />
            ) : byPaymentMode.length > 0 ? (
              <ChartContainer config={{}} className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byPaymentMode}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold text-sm">{data.name}</p>
                              <p className="text-sm text-muted-foreground">₹{data.total.toFixed(2)}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="total" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Tags breakdown */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">Spending by Tags</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Total: ₹{totalTags.toFixed(2)}</p>
            </div>
            {byTagRaw.length > 10 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs"
                onClick={() => setShowAllTags((s) => !s)}
                aria-expanded={showAllTags}
              >
                {showAllTags ? "Show top 10" : `Show all (${byTagRaw.length})`}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[320px] w-full rounded-lg" />
            ) : byTag.length > 0 ? (
              <ChartContainer config={{}} className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byTag}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-semibold text-sm">{data.name}</p>
                              <p className="text-sm text-muted-foreground">₹{data.total.toFixed(2)}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="total" fill="hsl(var(--chart-3))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
