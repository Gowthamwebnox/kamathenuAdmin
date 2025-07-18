import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface OrderStatusCardProps {
  title: string
  value: string
  icon: React.ReactNode
  bgColor?: string
  textColor?: string
}

export function OrderStatusCard({
  title,
  value,
  icon,
  bgColor = "bg-blue-50",
  textColor = "text-blue-500",
}: OrderStatusCardProps) {
  return (
    <div className={cn("flex items-center justify-between p-4 rounded-xl", bgColor)}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", bgColor)}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={cn("text-xl font-semibold", textColor)}>{value}</p>
        </div>
      </div>
    </div>
  )
}
