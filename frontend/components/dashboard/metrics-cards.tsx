"use client"

import { Card } from "@/components/ui/card"
import { Cloud, Droplets, Wind } from "lucide-react"

interface ComfortData {
  city: string
  temperature: number
  humidity: number
  windSpeed: number
  description: string
  comfortScore: number
  rank: number
}

interface MetricsCardsProps {
  data: ComfortData[]
}

export function MetricsCards({ data }: MetricsCardsProps) {
  if (data.length === 0) return null

  const sortedByComfort = [...data].sort((a, b) => b.comfortScore - a.comfortScore)
  const mostComfortable = sortedByComfort[0]
  const leastComfortable = sortedByComfort[sortedByComfort.length - 1]
  const averageComfort = Math.round(data.reduce((acc, d) => acc + d.comfortScore, 0) / data.length)

  const cards = [
    {
      label: "Most Comfortable",
      value: mostComfortable.city,
      metric: `${mostComfortable.comfortScore}°C`,
      icon: Cloud,
      color: "text-blue-400",
    },
    {
      label: "Least Comfortable",
      value: leastComfortable.city,
      metric: `${leastComfortable.comfortScore}°C`,
      icon: Cloud,
      color: "text-orange-400",
    },
    {
      label: "Average Comfort",
      value: `${averageComfort}`,
      metric: "Index",
      icon: Droplets,
      color: "text-cyan-400",
    },
    {
      label: "Total Cities",
      value: `${data.length}`,
      metric: "Tracked",
      icon: Wind,
      color: "text-purple-400",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card
            key={index}
            className="bg-card border border-border hover:border-primary/50 transition-all group cursor-default"
          >
            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">{card.label}</p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-foreground mt-1 sm:mt-2 truncate">{card.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{card.metric}</p>
                </div>
                <div className={`p-1.5 sm:p-2 bg-primary/10 rounded-lg ${card.color} flex-shrink-0`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent w-3/4" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
