"use client"

import dynamic from "next/dynamic"
import { ApexOptions } from "apexcharts"

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export function RevenueLineChart() {
  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 200,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ["#f59e0b", "#ef4444"],
    stroke: {
      width: 2,
      curve: "smooth",
    },
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    markers: {
      size: 0,
      hover: {
        size: 5,
      },
    },
    xaxis: {
      categories: ["00", "03", "06", "09", "12", "15", "18", "21", "23"],
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
      min: 0,
      max: 12,
      labels: {
        formatter: function (value) {
          return value + "w"
        },
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      shared: true,
      custom: function({ series, seriesIndex, dataPointIndex }) {
        return '<div class="p-2 bg-white shadow-lg rounded-lg border">' +
          '<div class="text-yellow-500">' +
          'Atlanta: ' + series[0][dataPointIndex].toLocaleString() +
          '</div>' +
          '<div class="text-red-500">' +
          'Baltimore: ' + series[1][dataPointIndex].toLocaleString() +
          '</div>' +
          '</div>'
      }
    },
  }

  const series = [
    {
      name: "Market Days",
      data: [2, 4, 6, 8, 9.5, 8.5, 7, 6, 5, 4.5, 4, 3.5, 3, 2.5, 2],
    },
    {
      name: "Market Days All",
      data: [1.5, 3, 5, 7, 9, 8, 6.5, 5.5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5],
    },
  ]

  return (
    <div className="w-full">
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={200}
      />
    </div>
  )
}
