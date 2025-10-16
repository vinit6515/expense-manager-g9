export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center">
          <span className="sr-only">Logo</span>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M3 3h18v4H3zM3 10h12v4H3zM3 17h8v4H3z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold tracking-tight text-balance">Expense Manager</h1>
          <p className="text-xs text-muted-foreground">Track and manage your expenses efficiently</p>
        </div>
      </div>
    </header>
  )
}
