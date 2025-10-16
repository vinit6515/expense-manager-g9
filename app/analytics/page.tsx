import { AppHeader } from "@/components/app-header"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { ExportExpenses } from "@/components/export-expenses"

export default function Page() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Analytics Dashboard</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Analyze your spending patterns across categories, payment methods, and tags. Export your expenses for
            detailed record-keeping.
          </p>
        </div>

        {/* Export Section */}
        <div className="mb-10">
          <ExportExpenses />
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          <AnalyticsCharts />
        </div>
      </main>
    </>
  )
}
