import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell, Plus, Search } from "lucide-react"
import Link from "next/link"

export function DashboardHeader() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <nav className="flex items-center space-x-6">
            <Link href="#" className="text-red-500 font-medium border-b-2 border-red-500 pb-3 -mb-3.5">
              Dashboard
            </Link>
            <Link href="#" className="text-gray-500 hover:text-gray-700">
              Orders
            </Link>
            <Link href="#" className="text-gray-500 hover:text-gray-700">
              Earnings
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="default" size="sm" className="bg-red-100 hover:bg-red-200 text-red-500">
            <Plus className="h-4 w-4 mr-1" />
            Add new
          </Button>

          <Button variant="ghost" size="icon" className="text-gray-500">
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="text-gray-500 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
