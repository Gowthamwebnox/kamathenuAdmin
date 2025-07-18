"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface FilterTab {
  id: string
  label: string
}

interface ProductFilterTabsProps {
  tabs: FilterTab[]
  defaultTab?: string
  activeTab?: string
  onChange: (tabId: string) => void
}

export function ProductFilterTabs({ tabs, defaultTab, activeTab, onChange }: ProductFilterTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0].id)

  // Use activeTab prop if provided (controlled), otherwise use internal state (uncontrolled)
  const currentActiveTab = activeTab !== undefined ? activeTab : internalActiveTab

  const handleTabChange = (tabId: string) => {
    if (activeTab === undefined) {
      setInternalActiveTab(tabId)
    }
    onChange(tabId)
  }

  return (
    <div className="flex space-x-1 border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-all relative",
            currentActiveTab === tab.id ? "text-[#6366f1]" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
          {currentActiveTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366f1]" />}
        </button>
      ))}
    </div>
  )
}
