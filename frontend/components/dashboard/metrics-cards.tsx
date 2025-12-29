"use client"

import { Card } from "@/components/ui/card"
import { Cloud, Droplets, Wind, Thermometer } from "lucide-react"

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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-4">
      {/* Most Comfortable Card */}
      <Card className="bg-card border border-border hover:border-primary/50 transition-all group cursor-default">
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">Most Comfortable</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-foreground mt-1 sm:mt-2 truncate">{mostComfortable.city}</p>
              <p className="text-[10px] sm:text-xs font-semibold text-blue-400 mt-0.5 sm:mt-1">Comfort: {mostComfortable.comfortScore}</p>
            </div>
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg text-blue-400 flex-shrink-0">
              <Cloud className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="space-y-1 sm:space-y-1.5 mt-2 sm:mt-3">
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                Temperature
              </span>
              <span className="font-medium text-foreground">{mostComfortable.temperature}°C</span>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                Humidity
              </span>
              <span className="font-medium text-foreground">{mostComfortable.humidity}%</span>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Wind className="w-3 h-3" />
                Wind Speed
              </span>
              <span className="font-medium text-foreground">{mostComfortable.windSpeed} km/h</span>
            </div>
            <div className="text-[10px] sm:text-xs pt-1">
              <span className="text-muted-foreground">Conditions: </span>
              <span className="font-medium text-foreground capitalize">{mostComfortable.description}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Least Comfortable Card */}
      <Card className="bg-card border border-border hover:border-primary/50 transition-all group cursor-default">
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">Least Comfortable</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-foreground mt-1 sm:mt-2 truncate">{leastComfortable.city}</p>
              <p className="text-[10px] sm:text-xs font-semibold text-orange-400 mt-0.5 sm:mt-1">Comfort: {leastComfortable.comfortScore}</p>
            </div>
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg text-orange-400 flex-shrink-0">
              <Cloud className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="space-y-1 sm:space-y-1.5 mt-2 sm:mt-3">
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                Temperature
              </span>
              <span className="font-medium text-foreground">{leastComfortable.temperature}°C</span>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                Humidity
              </span>
              <span className="font-medium text-foreground">{leastComfortable.humidity}%</span>
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Wind className="w-3 h-3" />
                Wind Speed
              </span>
              <span className="font-medium text-foreground">{leastComfortable.windSpeed} km/h</span>
            </div>
            <div className="text-[10px] sm:text-xs pt-1">
              <span className="text-muted-foreground">Conditions: </span>
              <span className="font-medium text-foreground capitalize">{leastComfortable.description}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Average Comfort Card */}
      <Card className="bg-card border border-border hover:border-primary/50 transition-all group cursor-default">
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">Average Comfort</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-foreground mt-1 sm:mt-2 truncate">{averageComfort}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Index</p>
            </div>
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg text-cyan-400 flex-shrink-0">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent w-3/4" />
          </div>
        </div>
      </Card>

      {/* Total Cities Card */}
      <Card className="bg-card border border-border hover:border-primary/50 transition-all group cursor-default">
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">Total Cities</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-foreground mt-1 sm:mt-2 truncate">{data.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Tracked</p>
            </div>
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg text-purple-400 flex-shrink-0">
              <Wind className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent w-3/4" />
          </div>
        </div>
      </Card>
    </div>
  )
}
