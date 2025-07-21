"use client"

import { usePathname } from "next/navigation"
import { MenuDrawerLayout } from "@/components/common/menu-drawer/drawer"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Check if current path is login page
  const isLoginPage = pathname?.includes("/login")
  
  // If it's the login page, render children without menu/header
  if (isLoginPage) {
    return <>{children}</>
  }
  
  // For all other pages, render with menu/header
  return <MenuDrawerLayout>{children}</MenuDrawerLayout>
} 