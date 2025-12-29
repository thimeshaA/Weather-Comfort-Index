"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardHeader } from "@/components/dashboard/header"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { ComfortTable } from "@/components/dashboard/comfort-table"
import { TemperatureChart } from "@/components/dashboard/temperature-chart"
import { Spinner } from "@/components/ui/spinner"
import { getComfortIndex, type ComfortData } from "@/lib/api"

export default function DashboardPage() {
  const { user, isLoading: userLoading } = useAuth()
  const [data, setData] = useState<ComfortData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    const fetchData = async () => {
      if (userLoading || !user) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch access token from session
        const tokenResponse = await fetch('/api/auth/token')
        const { accessToken } = await tokenResponse.json()
        
        if (!accessToken) {
          throw new Error('No access token available')
        }

        // Fetch comfort index data from backend
        const response = await getComfortIndex(accessToken)
        setData(response.cities)
        setLastRefresh(new Date(response.generatedAt))
      } catch (err) {
        console.error('Error fetching comfort data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, userLoading])



  if (isLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 bg-card border border-border rounded-lg">
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <DashboardHeader lastRefresh={lastRefresh} />
      <div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-4 p-2 sm:p-4 overflow-y-auto lg:overflow-hidden">
        {/* Metrics Cards - Stack on mobile, sidebar on desktop */}
        <div className="w-full lg:w-80 flex-shrink-0 lg:overflow-auto">
          <MetricsCards data={data} />
        </div>
        
        {/* Chart and Table - Always stacked vertically */}
        <div className="flex-1 flex flex-col gap-2 sm:gap-4 min-w-0 lg:overflow-hidden">
          {/* Temperature Chart */}
          <div className="h-[50vh] lg:flex-1 lg:min-h-0">
            <TemperatureChart data={data} />
          </div>
          
          {/* Comfort Table */}
          <div className="flex-1 min-h-[250px] sm:min-h-0 overflow-auto">
            <ComfortTable data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
