import { AppHeader } from "@/components/app-header"
import { StatsGrid } from "@/components/stats-grid"
import { IncomeForm } from "@/components/income-form"
import { ExpenseForm } from "@/components/expense-form"
import { RecentExpenses } from "@/components/recent-expenses"

export default function Page() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6">
        <StatsGrid />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <IncomeForm />
          </div>
          <div className="md:col-span-2">
            <ExpenseForm />
          </div>
        </div>
        <RecentExpenses />
      </main>
    </>
  )
}
