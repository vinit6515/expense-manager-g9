"use client"

import type React from "react"

import { useState } from "react"
import { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

export function IncomeForm() {
  const [amount, setAmount] = useState<string>("")
  const [source, setSource] = useState<string>("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = Number(amount || 0)
    if (!amt || isNaN(amt)) return
    await api("/income", {
      method: "POST",
      body: JSON.stringify({ amount: amt, source }),
    })
    setAmount("")
    setSource("")
    mutate("/stats")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Income</CardTitle>
        <p className="text-xs text-muted-foreground">Set your income for this month</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="text-sm">Income Amount</label>
          <Input inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <label className="text-sm">Source (Optional)</label>
          <Input placeholder="e.g., Salary, Freelance" value={source} onChange={(e) => setSource(e.target.value)} />
          <Button type="submit" className="mt-2">
            Set Income
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
