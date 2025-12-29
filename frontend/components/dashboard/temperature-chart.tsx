"use client"

import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"
import type { ComfortData } from "@/lib/api"

interface TemperatureChartProps {
  data: ComfortData[]
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload
    if (!data) return null
    
    return (
      <div className="bg-card/95 backdrop-blur-sm border-2 border-primary/30 rounded-lg shadow-xl p-4 min-w-[220px]">
        <p className="font-bold text-foreground mb-3 text-sm border-b border-border pb-2">{label}</p>
        <div className="space-y-2">
          {/* Comfort Score */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Comfort Score:</span>
            <span className="text-sm font-bold text-emerald-500">{data.comfort}</span>
          </div>
          
          {/* Divider */}
          <div className="border-t border-border/50 my-2" />
          
          {/* Contributing Factors */}
          <p className="text-xs font-semibold text-muted-foreground mb-1">Contributing Factors:</p>
          
          {/* Temperature */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: data.tempColor }}
              />
              <span className="text-xs text-muted-foreground">Temperature:</span>
            </div>
            <span className="text-sm font-medium text-foreground">{data.temperature}°C</span>
          </div>
          
          {/* Humidity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-xs text-muted-foreground">Humidity:</span>
            </div>
            <span className="text-sm font-medium text-foreground">{data.humidity}%</span>
          </div>
          
          {/* Wind Speed */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="text-xs text-muted-foreground">Wind Speed:</span>
            </div>
            <span className="text-sm font-medium text-foreground">{data.windSpeed} m/s</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

// Function to get temperature color
const getTemperatureColor = (temp: number) => {
  if (temp >= 28) return "#ef4444" // Red for hot
  if (temp <= 18) return "#3b82f6" // Blue for cool
  return "#eab308" // Yellow for normal
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  const chartData = data.map((city) => ({
    name: city.city,
    temperature: Math.round(city.temperature),
    comfort: city.comfortScore,
    humidity: city.humidity,
    windSpeed: city.windSpeed,
    tempColor: getTemperatureColor(city.temperature),
  }))

  return (
    <Card className="p-2 sm:p-3 lg:p-4 shadow-lg h-full flex flex-col">
      <div className="mb-1 sm:mb-2 flex-shrink-0">
        <h2 className="text-sm sm:text-base lg:text-lg font-bold text-foreground">Temperature & Comfort Trends</h2>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          Temperature: <span className="text-blue-500">Cool</span> · <span className="text-yellow-500">Normal</span> · <span className="text-red-500">Hot</span> | Comfort: <span className="text-emerald-500">Score</span>
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 40 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#475569"
              opacity={0.3}
            />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={50}
              tick={{ 
                fill: "#64748b",
                fontSize: 9
              }}
              stroke="#64748b"
            />
            <YAxis 
              yAxisId="left"
              domain={[0, 'auto']}
              tick={{ 
                fill: "#64748b",
                fontSize: 10
              }}
              stroke="#64748b"
              label={{ value: '°C', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10 } }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ 
                fill: "#64748b",
                fontSize: 10
              }}
              stroke="#64748b"
              label={{ value: 'Score', angle: 90, position: 'insideRight', style: { fill: '#64748b', fontSize: 10 } }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            
            {/* Comfort Score - Solid Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="comfort"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 5 }}
              name="Comfort Score"
              activeDot={{ r: 7 }}
            />
            
            {/* Temperature - Scatter with color coding */}
            <Scatter
              yAxisId="left"
              dataKey="temperature"
              name="Temperature (°C)"
              shape={(props: any) => {
                const { cx, cy, payload } = props
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={payload.tempColor}
                    stroke="#ffffff"
                    strokeWidth={2}
                    opacity={0.9}
                  />
                )
              }}
            />
            
            {/* Temperature connecting line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              stroke="#64748b"
              strokeWidth={2}
              dot={false}
              name="Temperature Trend"
              opacity={0.8}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
