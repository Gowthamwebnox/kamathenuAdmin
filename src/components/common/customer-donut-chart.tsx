"use client"

import dynamic from "next/dynamic"
import { ApexOptions } from "apexcharts"

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface CustomerDonutChartProps {
  percentage: number
}

export function CustomerDonutChart({ percentage }: CustomerDonutChartProps) {
  const options: ApexOptions = {
    chart: {
      type: "donut",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            name: {
              show: false,
            },
            value: {
              show: true,
              fontSize: "40px",
              fontWeight: "bold",
              color: "#333",
              formatter: function () {
                return `${percentage}%`
              },
            },
            total: {
              show: false,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    legend: {
      show: false,
    },
    colors: ["#FFDB58"],
    tooltip: {
      enabled: false,
    },
  }

  const series = [percentage, 100 - percentage]

  return (
    <div className="flex justify-center">
      <div className="w-[200px] h-[200px]">
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height="100%"
        />
      </div>
    </div>
  )
}
