import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Image from "next/image"
import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string
  change: string
  period: string
  icon: ReactNode
  iconBg: string
  avatars?: string[]
  bgColor: string
}

export function StatCard({ title, value, change, period, icon, iconBg, avatars, bgColor }: StatCardProps) {
  return (
    <Card className={cn("border-none shadow-none", bgColor)}>
      <CardContent className="px-6 ">
        <h3 className="text-gray-700 font-medium mb-1">{title}</h3>
        <div className="text-4xl font-bold mb-4">{value}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-green-600 text-sm font-medium mr-1">{change}</span>
            <span className="text-gray-500 text-sm">{period}</span>
          </div>

          {avatars ? (
            <div className="flex ">
              {/* <Image src={icon as string} alt="Stat icon" width={40} height={40} className={cn("rounded-full", iconBg)} /> */}
              {avatars.map((avatar, index) => (
                <Avatar key={index} className="border-2 border-white w-8 h-8">
                  <AvatarImage src={avatar || "/placeholder.svg"} alt={`User ${index + 1}`} />
                  <AvatarFallback>U{index + 1}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          ) : (
            <Image src={icon as string} alt="Stat icon" width={55} height={55} className={""} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
