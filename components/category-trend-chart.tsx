"use client"

import useSWR from "swr"
import { API_BASE, swrFetcher, buildQuery } from "@/lib/api"
import { useState } from "react"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

type TrendType = "daily" | "monthly" | "yearly"

const CATEGORIES = [
  "Transportation",
  "Groceries", 
  "Food & Dining",
  "Personal Care",
  "Health & Wellness",
  "Entertainment & Leisure",
  "Shopping",
  "Investments",
  "Travel",
  "Utilities",
  "Subscriptions",
  "Family & Dependents",
  "Official",
  "Credit Card Bills"
]

// Color palette for charts
const CHART_COLORS = [
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

export function CategoryTrendChart() {
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0])
  const [trendType, setTrendType] = useState<TrendType>("daily")

  // Fetch trend data for selected category
  const { data: trendData, isLoading: loadingTrend } = useSWR(
    selectedCategory
      ? `${API_BASE}/analytics/category-trend?category=${encodeURIComponent(selectedCategory)}&type=${trendType}`
      : null,
    swrFetcher,
    { 
      refreshInterval: 30000,
      revalidateOnFocus: false
    },
  )

  const chartData = trendData || []
  const totalAmount = chartData.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)

  const trendTypeLabel = {
    daily: "Daily Trend",
    monthly: "Month-on-Month Trend", 
    yearly: "Year-on-Year Trend",
  }

  const getCategoryColor = (category: string) => {
    const index = CATEGORIES.indexOf(category) % CHART_COLORS.length
    return CHART_COLORS[index]
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
          Category Spending Trends
        </CardTitle>
        <p className="text-xs text-gray-500">Analyze spending patterns for specific categories</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls - More Compact */}
        <div className="flex flex-col sm:flex-row gap-3 p-3 bg-white/50 rounded-lg border border-gray-100">
          <div className="flex-1">
            <label className="text-xs font-medium mb-1 block text-gray-700">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white border-gray-200 h-8 text-sm">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: getCategoryColor(cat) }}
                    />
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-xs font-medium mb-1 block text-gray-700">Trend Type</label>
            <div className="flex gap-1 flex-wrap">
              {(["daily", "monthly", "yearly"] as TrendType[]).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={trendType === type ? "default" : "outline"}
                  onClick={() => setTrendType(type)}
                  className="h-7 text-xs px-2 transition-all duration-200"
                >
                  {type === "daily" ? "Daily" : type === "monthly" ? "Monthly" : "Yearly"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-100">
          <p className="text-xs text-gray-600">
            {trendTypeLabel[trendType]} for <strong className="text-gray-800">{selectedCategory}</strong> • Total:{" "}
            <span className="font-bold text-blue-600">₹{totalAmount.toFixed(2)}</span>
          </p>
        </div>

        {/* Chart - Much Smaller */}
        {loadingTrend ? (
          <Skeleton className="h-[250px] w-full rounded-lg" />
        ) : chartData.length > 0 ? (
          <ChartContainer config={{}} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {trendType === "daily" ? (
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={getCategoryColor(selectedCategory)} stopOpacity={0.8}/>
                      <stop offset="100%" stopColor={getCategoryColor(selectedCategory)} stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#6b7280"
                    fontSize={10}
                    tickMargin={5}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={10}
                    tickMargin={5}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload?.[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg text-xs">
                            <p className="font-semibold text-gray-800">{data.label}</p>
                            <p className="font-medium" style={{ color: getCategoryColor(selectedCategory) }}>
                              ₹{data.amount.toFixed(2)}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="url(#lineGradient)"
                    strokeWidth={2}
                    dot={{ fill: getCategoryColor(selectedCategory), strokeWidth: 1, r: 2 }}
                    activeDot={{ r: 4, fill: getCategoryColor(selectedCategory) }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#6b7280"
                    fontSize={10}
                    tickMargin={5}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={10}
                    tickMargin={5}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload?.[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg text-xs">
                            <p className="font-semibold text-gray-800">{data.label}</p>
                            <p className="font-medium" style={{ color: getCategoryColor(selectedCategory) }}>
                              ₹{data.amount.toFixed(2)}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColor(selectedCategory)} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-500 border border-dashed border-gray-300 rounded-lg text-sm">
            No data available for {selectedCategory}
          </div>
        )}
      </CardContent>
    </Card>
  )
}