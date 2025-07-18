"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronUp } from "lucide-react"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { ApexOptions } from "apexcharts"
import { formatCurrency } from "@/lib/utils"

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface RevenueChartProps {
  totalRevenue: number;
}

export function RevenueChart({ totalRevenue }: RevenueChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const chartOptions: ApexOptions = {
    chart: {
      type: "area" as const,
      height: 200,
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: false,
      },
    },
    colors: ["#FFDB58"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    stroke: {
      width: 2,
      curve: "smooth",
    },
    xaxis: {
      type: "numeric",
      axisBorder: {
        show: false,
      },
      labels: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
    grid: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: false,
    },
  }

  const series = [
    {
      name: "Revenue",
      data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 150, 135, 140, 130],
    },
  ]

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">Revenue Overview</h3>
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
          <TabsTrigger
            value="today"
            className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-500 rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            Today
          </TabsTrigger>
          <TabsTrigger
            value="week"
            className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-500 rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            Week
          </TabsTrigger>
          <TabsTrigger
            value="month"
            className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 data-[state=active]:text-yellow-500 rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent"
          >
            Month
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-3xl font-bold">{totalRevenue}</h3>
            <ChevronUp className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-sm text-gray-500 mb-4">Total Income view</p>

          <div className="relative">
            <div className="absolute top-0 right-16 bg-yellow-500 text-white text-xs px-2 py-1 rounded">80%</div>
            {mounted && (
              <ReactApexChart
                options={chartOptions}
                series={series}
                type="area"
                height={200}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="week" className="mt-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-3xl font-bold">785,420</h3>
            <ChevronUp className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-sm text-gray-500 mb-4">Total Income view</p>

          <div className="relative">
            {mounted && (
              <ReactApexChart
                options={chartOptions}
                series={series}
                type="area"
                height={200}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="month" className="mt-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-3xl font-bold">2,458,900</h3>
            <ChevronUp className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-sm text-gray-500 mb-4">Total Income view</p>

          <div className="relative">
            {mounted && (
              <ReactApexChart
                options={chartOptions}
                series={series}
                type="area"
                height={200}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
      <div className="text-center">
        <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        <p className="text-sm text-gray-500">Total Revenue</p>
      </div>
    </div>
  )
}
