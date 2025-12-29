"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Droplets, Wind, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"

interface ComfortData {
  city: string
  temperature: number
  humidity: number
  windSpeed: number
  description: string
  comfortScore: number
  rank: number
}

interface ComfortTableProps {
  data: ComfortData[]
}

type SortField = "rank" | "temperature" | "comfort"
type SortOrder = "asc" | "desc"

export function ComfortTable({ data }: ComfortTableProps) {
  const [sortField, setSortField] = useState<SortField>("rank")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const getMedalEmoji = (index: number) => {
    if (index === 0) return "1"
    if (index === 1) return "2"
    if (index === 2) return "3"
    return `${index + 1}`
  }

  const getComfortColor = (score: number) => {
    if (score >= 75) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (score >= 50) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const sortedData = [...data].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case "rank":
        comparison = a.rank - b.rank
        break
      case "temperature":
        comparison = a.temperature - b.temperature
        break
      case "comfort":
        comparison = a.comfortScore - b.comfortScore
        break
    }
    return sortOrder === "asc" ? comparison : -comparison
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
    )
  }

  return (
    <Card className="bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="px-3 sm:px-4 lg:px-6 pb-2 border-b border-border flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">Comfort Index Rankings</h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">Click column headers to sort</p>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap pt-1">
          <span className="hidden sm:inline">Showing {sortedData.length} cities • Sorted by{" "}
          {sortField === "rank" ? "Rank" : sortField === "temperature" ? "Temperature" : "Comfort Index"} (
          {sortOrder === "asc" ? "Low to High" : "High to Low"})</span>
          <span className="sm:hidden">{sortedData.length} cities</span>
        </p>
      </div>

      {/* Table */}
      <div>
        <table className="w-full">
          <thead className="bg-muted/50 border-b-2 border-border">
            <tr>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-muted-foreground">
                <button
                  onClick={() => handleSort("rank")}
                  className="flex items-center gap-1.5 hover:text-foreground transition-all hover:bg-primary/10 px-2 py-1 rounded-md cursor-pointer group"
                >
                  <span className="group-hover:font-bold">Rank</span>
                  <SortIcon field="rank" />
                </button>
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-muted-foreground">
                City
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-muted-foreground">
                Weather
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-muted-foreground">
                <button
                  onClick={() => handleSort("temperature")}
                  className="flex items-center gap-1.5 hover:text-foreground transition-all hover:bg-primary/10 px-2 py-1 rounded-md cursor-pointer group"
                >
                  <span className="group-hover:font-bold">Temp</span>
                  <SortIcon field="temperature" />
                </button>
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-muted-foreground">
                Humidity
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-muted-foreground">
                Wind
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-muted-foreground">
                <button
                  onClick={() => handleSort("comfort")}
                  className="flex items-center gap-1.5 hover:text-foreground transition-all hover:bg-primary/10 px-2 py-1 rounded-md cursor-pointer group"
                >
                  <span className="hidden sm:inline group-hover:font-bold">Comfort</span>
                  <span className="sm:hidden group-hover:font-bold">Score</span>
                  <SortIcon field="comfort" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={item.city} className="border-b border-border hover:bg-primary/5 transition-colors">
                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary font-bold text-xs sm:text-sm">
                      {getMedalEmoji(item.rank - 1)}
                    </span>
                  </div>
                </td>
                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="font-medium text-foreground text-xs sm:text-sm truncate">{item.city}</span>
                  </div>
                </td>
                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm text-muted-foreground truncate max-w-[120px]">{item.description}</td>
                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm text-muted-foreground">{item.temperature}°C</td>
                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Droplets className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{item.humidity}%</span>
                  </div>
                </td>
                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Wind className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{item.windSpeed}m/s</span>
                  </div>
                </td>
                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                  <span
                    className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold border ${getComfortColor(
                      item.comfortScore,
                    )}`}
                  >
                    {item.comfortScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
