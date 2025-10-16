"use client"

import type React from "react"

import { useState } from "react"
import { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import type { Expense } from "@/lib/types"

const CATEGORIES = ["Groceries", "Bills & Utilities", "Transport", "Entertainment", "Healthcare", "Investment", "Other"]

const PAYMENT_MODES = ["Cash", "UPI", "Credit Card", "Debit Card", "Net Banking"]

export function ExpenseForm() {
  const [amount, setAmount] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [payment, setPayment] = useState<string>("")
  const [tagInput, setTagInput] = useState<string>("")
  const [tags, setTags] = useState<string[]>([])
  const [remarks, setRemarks] = useState<string>("")

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags((p) => [...p, t])
    setTagInput("")
  }
  function removeTag(t: string) {
    setTags((p) => p.filter((x) => x !== t))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = Number(amount || 0)
    if (!amt || !category || !payment) return
    const payload: Expense = {
      amount: amt,
      category,
      payment_mode: payment,
      tags,
      remarks,
      type: category === "Investment" ? "investment" : "expense",
    }
    await api("/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    setAmount("")
    setCategory("")
    setPayment("")
    setTags([])
    setRemarks("")
    // refresh stats and recent list
    mutate("/stats")
    mutate("/expenses?limit=10")
    mutate("/analytics")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add New Expense</CardTitle>
        <p className="text-xs text-muted-foreground">Track your spending across different categories</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm">Amount</label>
              <Input
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Category</label>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Mode of Payment</label>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              >
                <option value="">Select payment mode</option>
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Tags</label>
              <div className="flex items-center gap-2">
                <Input placeholder="Add tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
                <Button type="button" variant="secondary" onClick={addTag}>
                  +
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => removeTag(t)}
                      className="rounded-full border px-3 py-1 text-xs"
                    >
                      {t} ✕
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Remarks</label>
            <textarea
              className="min-h-24 rounded-md border bg-background p-3 text-sm"
              placeholder="Add any additional notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-10">
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
