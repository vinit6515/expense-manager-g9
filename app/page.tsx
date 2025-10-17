"use client"
import { AppHeader } from "@/components/app-header"

import { StatsGrid } from "@/components/stats-grid"
import { IncomeForm } from "@/components/income-form"
import { ExpenseForm } from "@/components/expense-form"
import { RecentExpenses } from "@/components/recent-expenses"

export default function Page() {
  const handleAnalyticsClick = () => {
    window.open('https://expense-manager-g9.vercel.app/analytics', '_blank')
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6">
        {/* Top section with title and button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your finances</p>
          </div>
          <button
            onClick={handleAnalyticsClick}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="mr-2"
            >
              <path d="M3 3v18h18"/>
              <path d="m19 9-5 5-4-4-3 3"/>
            </svg>
            View Analytics
          </button>
        </div>

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