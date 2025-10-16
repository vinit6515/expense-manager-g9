"use client"

import useSWR from "swr"
import { API_BASE, swrFetcher, buildQuery } from "@/lib/api"
import type { AnalyticsBreakdown, AnalyticsTimeseriesPoint } from "@/lib/types"
import { useMemo, useState } from "react"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Bar, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryTrendChart } from "./category-trend-chart"

// Enhanced color palette
const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
  "#ec4899", // Pink
  "#6366f1", // Indigo
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
      <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Time Range:</span>
            <div className="flex gap-2 flex-wrap">
              {(["30d", "90d", "mtd", "ytd"] as RangeKey[]).map((key) => (
                <Button
                  key={key}
                  size="sm"
                  variant={range === key ? "default" : "outline"}
                  onClick={() => setRange(key)}
                  aria-pressed={range === key}
                  className="transition-all duration-200 hover:scale-105"
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

              
      {/* Category Trend Chart */}
      <CategoryTrendChart />

      {/* Three Column Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category breakdown */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              Spending by Category
            </CardTitle>
            <p className="text-sm text-gray-500">Total: <span className="font-semibold text-blue-600">₹{totalCategory.toFixed(2)}</span></p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[320px] w-full rounded-xl" />
            ) : byCategory.length > 0 ? (
              <ChartContainer config={{}} className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="total"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                      
                      labelLine={false}
                    >
                      {byCategory.map((_, i) => (
                        <Cell 
                          key={i} 
                          fill={COLORS[i % COLORS.length]} 
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          const data = payload[0].payload
                          const pct = totalCategory ? Math.round((data.total / totalCategory) * 100) : 0
                          return (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                              <p className="font-semibold text-sm text-gray-800">{data.name}</p>
                              <p className="text-sm text-gray-600">₹{data.total.toFixed(2)}</p>
                              <p className="text-xs font-medium" style={{ color: COLORS[payload[0].payload.index % COLORS.length] }}>
                                {pct}% of total
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment mode breakdown */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-emerald-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              Spending by Payment Mode
            </CardTitle>
            <p className="text-sm text-gray-500">Total: <span className="font-semibold text-emerald-600">₹{totalPaymentMode.toFixed(2)}</span></p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[320px] w-full rounded-xl" />
            ) : byPaymentMode.length > 0 ? (
              <ChartContainer config={{}} className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={byPaymentMode}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    barSize={50}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                              <p className="font-semibold text-sm text-gray-800">{data.name}</p>
                              <p className="text-sm font-medium text-emerald-600">₹{data.total.toFixed(2)}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar 
                      dataKey="total" 
                      radius={[6, 6, 0, 0]}
                      opacity={0.8}
                    >
                      {byPaymentMode.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
                No payment mode data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags breakdown */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-amber-50">
          <CardHeader className="flex flex-row items-start justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                Spending by Tags
              </CardTitle>
              <p className="text-sm text-gray-500">Total: <span className="font-semibold text-amber-600">₹{totalTags.toFixed(2)}</span></p>
            </div>
            {byTagRaw.length > 10 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs transition-all duration-200 hover:scale-105 text-gray-600"
                onClick={() => setShowAllTags((s) => !s)}
                aria-expanded={showAllTags}
              >
                {showAllTags ? "Show top 10" : `Show all (${byTagRaw.length})`}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[320px] w-full rounded-xl" />
            ) : byTag.length > 0 ? (
              <ChartContainer config={{}} className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={byTag}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    barSize={35}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      stroke="#6b7280"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                              <p className="font-semibold text-sm text-gray-800">{data.name}</p>
                              <p className="text-sm font-medium text-amber-600">₹{data.total.toFixed(2)}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar 
                      dataKey="total" 
                      radius={[6, 6, 0, 0]}
                      opacity={0.8}
                    >
                      {byTag.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
                No tag data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}