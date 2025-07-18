"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import Link from "next/link";

// Context to manage the menu drawer state
type MenuDrawerContextType = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  activeItemId: string | null;
  setActiveItemId: React.Dispatch<React.SetStateAction<string | null>>;
  hoveyellowItemId: string | null;
  setHoveyellowItemId: React.Dispatch<React.SetStateAction<string | null>>;
};

const MenuDrawerContext = React.createContext<MenuDrawerContextType>({
  expanded: true,
  setExpanded: () => {},
  activeItemId: null,
  setActiveItemId: () => {},
  hoveyellowItemId: null,
  setHoveyellowItemId: () => {},
});

export const useMenuDrawer = () => React.useContext(MenuDrawerContext);

// Main MenuDrawer component
interface MenuDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  defaultActiveItemId?: string | null;
  activeItemId?: string;
  onActiveItemChange?: (itemId: string | null) => void;
  width?: string;
  collapsedWidth?: string;
}

export function MenuDrawer({
  children,
  defaultExpanded = true,
  expanded: controlledExpanded,
  onExpandedChange,
  defaultActiveItemId = null,
  activeItemId: controlledActiveItemId,
  onActiveItemChange,
  width = "240px",
  collapsedWidth = "64px",
  className,
  ...props
}: MenuDrawerProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] =
    React.useState(defaultExpanded);
  const [uncontrolledActiveItemId, setUncontrolledActiveItemId] =
    React.useState<string | null>(defaultActiveItemId);
  const [hoveyellowItemId, setHoveyellowItemId] = React.useState<string | null>(null);

  // Determine if component is controlled or uncontrolled
  const isExpandedControlled = controlledExpanded !== undefined;
  const isActiveItemControlled = controlledActiveItemId !== undefined;

  const expanded = isExpandedControlled
    ? controlledExpanded
    : uncontrolledExpanded;
  const activeItemId = isActiveItemControlled
    ? controlledActiveItemId
    : uncontrolledActiveItemId;

  // Handle state changes for controlled components
  const setExpanded = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const newValue = typeof value === "function" ? value(expanded) : value;
      if (!isExpandedControlled) {
        setUncontrolledExpanded(newValue);
      }
      onExpandedChange?.(newValue);
    },
    [expanded, isExpandedControlled, onExpandedChange]
  );

  const setActiveItemId = React.useCallback(
    (value: React.SetStateAction<string | null>) => {
      const newValue =
        typeof value === "function" ? value(activeItemId) : value;
      if (!isActiveItemControlled) {
        setUncontrolledActiveItemId(newValue);
      }
      onActiveItemChange?.(newValue);
    },
    [activeItemId, isActiveItemControlled, onActiveItemChange]
  );

  // Create context value
  const contextValue = React.useMemo(
    () => ({
      expanded,
      setExpanded,
      activeItemId,
      setActiveItemId,
      hoveyellowItemId,
      setHoveyellowItemId,
    }),
    [
      expanded,
      setExpanded,
      activeItemId,
      setActiveItemId,
      hoveyellowItemId,
      setHoveyellowItemId,
    ]
  );

  return (
    <MenuDrawerContext.Provider value={contextValue}>
      <div
        className={cn(
          "flex flex-col h-full bg-white border-r transition-all duration-300 ease-in-out relative",
          expanded ? `w-[${width}]` : `w-[${collapsedWidth}]`,
          className
        )}
        style={{
          width: expanded ? width : collapsedWidth,
          zIndex: 50,
        }}
        {...props}
      >
        {children}
      </div>
    </MenuDrawerContext.Provider>
  );
}

// MenuDrawer Header component
export function MenuDrawerHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = useMenuDrawer();

  return (
    <div
      className={cn(
        "flex items-center h-16 px-4 border-b sticky top-0 bg-white z-10",
        expanded ? "justify-between" : "justify-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// MenuDrawer Toggle component
export function MenuDrawerToggle({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { expanded, setExpanded } = useMenuDrawer();

  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors",
        className
      )}
      onClick={() => setExpanded(!expanded)}
      aria-label={expanded ? "Collapse menu" : "Expand menu"}
      {...props}
    >
      <ChevronRight
        className={cn(
          "h-5 w-5 transition-transform",
          expanded ? "rotate-180" : ""
        )}
      />
    </button>
  );
}

// MenuDrawer Content component
export function MenuDrawerContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-y-auto py-2", className)} {...props}>
      {children}
    </div>
  );
}

// MenuDrawer Footer component
export function MenuDrawerFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-auto border-t p-4", className)} {...props}>
      {children}
    </div>
  );
}

// MenuDrawer Group component
interface MenuDrawerGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function MenuDrawerGroup({
  children,
  title,
  className,
  ...props
}: MenuDrawerGroupProps) {
  const { expanded } = useMenuDrawer();

  return (
    <div className={cn("py-1", className)} {...props}>
      {title && expanded && (
        <h3 className="mb-1 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

// MenuDrawer Item styles
const menuItemVariants = cva(
  "flex items-center gap-3 rounded-md text-sm font-medium transition-colors relative group",
  {
    variants: {
      variant: {
        default: "text-gray-600 hover:bg-gray-100",
        active: "text-gray-500 bg-yellow-50 hover:bg-yellow-50 font-medium",
      },
      size: {
        default: "px-4 py-2",
        sm: "px-2 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// MenuDrawer Item component
interface MenuDrawerItemProps
  extends React.HTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof menuItemVariants> {
  id: string;
  icon: React.ReactNode;
  href?: string;
  active?: boolean;
}

export function MenuDrawerItem({
  children,
  id,
  icon,
  href = "#",
  active,
  variant,
  size,
  className,
  ...props
}: MenuDrawerItemProps) {
  const { expanded, activeItemId, setActiveItemId, setHoveyellowItemId } =
    useMenuDrawer();
  const isActive = active !== undefined ? active : activeItemId === id;
  const itemVariant = isActive ? "active" : "default";
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({
    top: 0,
    left: 0,
  });
  const itemRef = React.useRef<HTMLAnchorElement>(null);

  // Calculate tooltip position
  React.useEffect(() => {
    if (itemRef.current && !expanded) {
      const rect = itemRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top,
        left: rect.right + 8, // Add 8px margin
      });
    }
  }, [expanded, showTooltip]);

  return (
    <>
      <Link
        ref={itemRef}
        href={href}
        className={cn(
          menuItemVariants({ variant: itemVariant, size }),
          className
        )}
        onMouseEnter={() => {
          setHoveyellowItemId(id);
          setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setHoveyellowItemId(null);
          setShowTooltip(false);
        }}
        {...props}
      >
        <span className="flex-shrink-0">{icon}</span>
        {expanded && <span className="truncate">{children}</span>}
      </Link>

      {!expanded &&
        showTooltip &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed rounded-md bg-white px-2 py-1 shadow-md border whitespace-nowrap z-[9999]"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
}

// MenuDrawer Collapsible component
interface MenuDrawerCollapsibleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  icon: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  active?: boolean;
}

export function MenuDrawerCollapsible({
  children,
  id,
  icon,
  title,
  defaultOpen = false,
  active,
  className,
  ...props
}: MenuDrawerCollapsibleProps) {
  const { expanded, activeItemId, hoveyellowItemId, setHoveyellowItemId } =
    useMenuDrawer();
  const [open, setOpen] = React.useState(defaultOpen);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({
    top: 0,
    left: 0,
  });
  const itemRef = React.useRef<HTMLDivElement>(null);

  // Check if this item or any of its children are active
  const isActive =
    active !== undefined
      ? active
      : activeItemId === id || (activeItemId?.startsWith(id + ".") ?? false);

  // Calculate tooltip position
  React.useEffect(() => {
    if (itemRef.current && !expanded) {
      const rect = itemRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top,
        left: rect.right + 8, // Add 8px margin
      });
    }
  }, [expanded, showTooltip]);

  return (
    <>
      <div
        ref={itemRef}
        className={cn("relative group", className)}
        onMouseEnter={() => {
          setHoveyellowItemId(id);
          setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setHoveyellowItemId(null);
          setShowTooltip(false);
        }}
        {...props}
      >
        <button
          type="button"
          onClick={() => expanded && setOpen(!open)}
          className={cn(
            "flex items-center w-full gap-3 px-4 py-2 text-sm font-medium transition-colors rounded-md",
            isActive
              ? "text-gray-500 bg-yellow-50"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <span className="flex-shrink-0">{icon}</span>
          {expanded && (
            <>
              <span className="flex-1 text-left truncate">{title}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  open ? "rotate-180" : ""
                )}
              />
            </>
          )}
        </button>

        {/* Expanded submenu */}
        {expanded && open && (
          <div className="pl-9 pr-2 py-1 space-y-1">{children}</div>
        )}
      </div>

      {/* Hover submenu in collapsed mode - rendeyellow with portal */}
      {!expanded &&
        showTooltip &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed rounded-md bg-white p-2 shadow-md border min-w-[180px] z-[9999]"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            <div className="font-medium mb-2 border-b pb-1">{title}</div>
            <div className="space-y-1">{children}</div>
          </div>,
          document.body
        )}
    </>
  );
}

// MenuDrawer SubItem component
interface MenuDrawerSubItemProps
  extends React.HTMLAttributes<HTMLAnchorElement> {
  id: string;
  href?: string;
  active?: boolean;
}

export function MenuDrawerSubItem({
  children,
  id,
  href = "#",
  active,
  className,
  ...props
}: MenuDrawerSubItemProps) {
  const { activeItemId, setActiveItemId } = useMenuDrawer();
  const isActive = active !== undefined ? active : activeItemId === id;

  return (
    <a
      href={href}
      className={cn(
        "flex items-center py-1 px-2 text-sm rounded-md transition-colors",
        isActive
          ? "text-gray-500 bg-yellow-50 font-medium"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        setActiveItemId(id);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
