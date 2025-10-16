"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { API_BASE } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, AlertCircle } from "lucide-react"

export function ExportExpenses() {
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getMonthOptions = () => {
    const months = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const label = date.toLocaleDateString("en-IN", { year: "numeric", month: "long" })
      months.push({ key, label })
    }
    return months
  }

  const handleDownload = async () => {
    if (!selectedMonth) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/expenses/export?month=${selectedMonth}`)
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `expenses-${selectedMonth}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Download error:", err)
      setError("Failed to download expenses. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-l-4 border-l-chart-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Expenses
        </CardTitle>
        <CardDescription>Download your expenses as CSV for a specific month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="flex gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a month..." />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map((opt) => (
                    <SelectItem key={opt.key} value={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleDownload} disabled={!selectedMonth || isLoading} className="gap-2">
              <Download className="w-4 h-4" />
              {isLoading ? "Downloading..." : "Download CSV"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            CSV includes: Date, Category, Payment Mode, Amount, Tags, and Remarks
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
