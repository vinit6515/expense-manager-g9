"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import type { Expense } from "@/lib/types"
import { X } from "lucide-react"

const CATEGORIES = ["Groceries", "Bills & Utilities", "Transport", "Entertainment", "Healthcare", "Investment", "Other"]
const PAYMENT_MODES = ["Cash", "UPI", "Credit Card", "Debit Card", "Net Banking"]

interface EditExpenseModalProps {
  expense: Expense
  onClose: () => void
  onSave: () => void
}

export function EditExpenseModal({ expense, onClose, onSave }: EditExpenseModalProps) {
  const [amount, setAmount] = useState(String(expense.amount))
  const [category, setCategory] = useState(expense.category)
  const [payment, setPayment] = useState(expense.payment_mode)
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState(expense.tags || [])
  const [remarks, setRemarks] = useState(expense.remarks || "")
  const [isLoading, setIsLoading] = useState(false)

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags((p) => [...p, t])
    setTagInput("")
  }

  const removeTag = (t: string) => {
    setTags((p) => p.filter((x) => x !== t))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(amount || 0)
    if (!amt || !category || !payment) return

    setIsLoading(true)
    try {
      await api(`/expenses/${expense._id}`, {
        method: "PUT",
        body: JSON.stringify({
          amount: amt,
          category,
          payment_mode: payment,
          tags,
          remarks,
        }),
      })
      onSave()
    } catch (err) {
      console.error("Update failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background">
          <h2 className="text-lg font-semibold">Edit Expense</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Amount</label>
            <Input inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Category</label>
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Payment Mode</label>
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              {PAYMENT_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Tags</label>
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
                    className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
                  >
                    {t} ✕
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Remarks</label>
            <textarea
              className="min-h-20 rounded-md border bg-background p-3 text-sm"
              placeholder="Add any additional notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
