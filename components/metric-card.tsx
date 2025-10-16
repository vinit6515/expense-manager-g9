"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MetricCard({
  title,
  subtitle,
  value,
  tone = "default",
  icon,
}: {
  title: string
  subtitle: string
  value: number
  tone?: "default" | "info" | "danger"
  icon?: React.ReactNode
}) {
  const toneClasses = tone === "info" ? "bg-muted" : tone === "danger" ? "bg-destructive/10" : "bg-card"
  return (
    <Card className={`${toneClasses}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">{subtitle}</CardTitle>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-semibold">₹{value.toFixed(2)}</div>
      </CardContent>
    </Card>
  )
}
