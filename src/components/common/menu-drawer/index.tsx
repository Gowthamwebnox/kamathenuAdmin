"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

interface MenuDrawerContextProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  activeItem: string | null
  setActiveItem: React.Dispatch<React.SetStateAction<string | null>>
}

const MenuDrawerContext = React.createContext<MenuDrawerContextProps>({
  isOpen: false,
  setIsOpen: () => {},
  activeItem: null,
  setActiveItem: () => {},
})

export interface MenuDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
  defaultActiveItem?: string
  onOpenChange?: (open: boolean) => void
  onActiveItemChange?: (item: string | null) => void
}

export function MenuDrawer({
  children,
  defaultOpen = false,
  defaultActiveItem = null,
  onOpenChange,
  onActiveItemChange,
  className,
  ...props
}: MenuDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const [activeItem, setActiveItem] = React.useState<string | null>(defaultActiveItem)

  React.useEffect(() => {
    onOpenChange?.(isOpen)
  }, [isOpen, onOpenChange])

  React.useEffect(() => {
    onActiveItemChange?.(activeItem)
  }, [activeItem, onActiveItemChange])

  const contextValue = React.useMemo(
    () => ({ isOpen, setIsOpen, activeItem, setActiveItem }),
    [isOpen, setIsOpen, activeItem, setActiveItem],
  )

  return (
    <MenuDrawerContext.Provider value={contextValue}>
      <div className={cn("relative", className)} {...props}>
        {children}
      </div>
    </MenuDrawerContext.Provider>
  )
}

export interface MenuDrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function MenuDrawerTrigger({ children, className, ...props }: MenuDrawerTriggerProps) {
  const { isOpen, setIsOpen } = React.useContext(MenuDrawerContext)

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn("inline-flex items-center justify-center", className)}
      aria-expanded={isOpen}
      {...props}
    >
      {children}
    </button>
  )
}

const menuDrawerContentVariants = cva(
  "fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto bg-background shadow-lg transition-transform duration-300 ease-in-out",
  {
    variants: {
      position: {
        left: "left-0 transform",
        right: "right-0 left-auto transform",
      },
      isOpen: {
        true: "translate-x-0",
        false: "-translate-x-full",
      },
    },
    defaultVariants: {
      position: "left",
      isOpen: false,
    },
    compoundVariants: [
      {
        position: "right",
        isOpen: false,
        class: "translate-x-full",
      },
    ],
  },
)

export interface MenuDrawerContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof menuDrawerContentVariants> {
  position?: "left" | "right"
}

export function MenuDrawerContent({ children, className, position = "left", ...props }: MenuDrawerContentProps) {
  const { isOpen, setIsOpen } = React.useContext(MenuDrawerContext)

  const handleOverlayClick = React.useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 transition-opacity" onClick={handleOverlayClick} />}
      <div className={cn(menuDrawerContentVariants({ position, isOpen }), className)} {...props}>
        {children}
      </div>
    </>
  )
}

export interface MenuDrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MenuDrawerHeader({ children, className, ...props }: MenuDrawerHeaderProps) {
  return (
    <div className={cn("p-4 border-b", className)} {...props}>
      {children}
    </div>
  )
}

export interface MenuDrawerBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MenuDrawerBody({ children, className, ...props }: MenuDrawerBodyProps) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  )
}

export interface MenuDrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MenuDrawerFooter({ children, className, ...props }: MenuDrawerFooterProps) {
  return (
    <div className={cn("p-4 border-t mt-auto", className)} {...props}>
      {children}
    </div>
  )
}

export interface MenuDrawerGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
}

export function MenuDrawerGroup({ children, title, className, ...props }: MenuDrawerGroupProps) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {title && <h3 className="mb-2 px-2 text-sm font-medium text-muted-foreground">{title}</h3>}
      <div className="space-y-1">{children}</div>
    </div>
  )
}

export interface MenuDrawerItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id: string
  icon?: React.ReactNode
  active?: boolean
}

export function MenuDrawerItem({ children, id, icon, active, className, ...props }: MenuDrawerItemProps) {
  const { activeItem, setActiveItem } = React.useContext(MenuDrawerContext)
  const isActive = active !== undefined ? active : activeItem === id

  const handleClick = React.useCallback(() => {
    setActiveItem(id)
  }, [setActiveItem, id])

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground hover:text-foreground",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}

export interface MenuDrawerCollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
}

export function MenuDrawerCollapsible({
  children,
  title,
  icon,
  defaultOpen = false,
  className,
  ...props
}: MenuDrawerCollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className={cn("mb-1", className)} {...props}>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("transition-transform", isOpen ? "rotate-180" : "")}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && <div className="mt-1 pl-4 space-y-1">{children}</div>}
    </div>
  )
}
