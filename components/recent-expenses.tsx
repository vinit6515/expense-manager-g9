"use client"

import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { swrFetcher, API_BASE } from "@/lib/api"
import type { Expense } from "@/lib/types"

export function RecentExpenses() {
  const { data, isLoading } = useSWR<{ items: Expense[] }>(`${API_BASE}/expenses?limit=10`, swrFetcher)

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—"
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "—"
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold mb-3">Recent Expenses</h2>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading…</div>
          ) : data && data.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                    <th className="px-4 py-3 text-left font-medium">Payment Mode</th>
                    <th className="px-4 py-3 text-left font-medium">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.items.map((e, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(e.date)}</td>
                      <td className="px-4 py-3 font-medium">{e.category}</td>
                      <td className="px-4 py-3 font-semibold">₹{e.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.payment_mode}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{e.tags?.join(", ") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-sm text-muted-foreground">
              <div className="mx-auto mb-3 h-10 w-10 rounded-md border flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M21 7H3V5h18v2Zm0 4H3V9h18v2Zm0 4H3v-2h18v2Zm0 4H3v-2h18v2Z" />
                </svg>
              </div>
              No expenses yet. Add your first expense to get started!
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
