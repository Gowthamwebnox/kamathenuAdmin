"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import {
  Search,
  Bell,
  Plus,
  LogOut,
} from "lucide-react";
import {
  MenuDrawer,
  MenuDrawerContent,
  MenuDrawerHeader,
  MenuDrawerItem,
  MenuDrawerToggle,
  MenuDrawerFooter,
} from "@/components/common/menu-drawer/menu-drawer";
import { Logo } from "@/components/common/menu-drawer/logo";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { menuItems } from "@/components/common/menu-drawer/menu";      
import { CommandMenu } from "@/components/cmdk/command-menu";

export function MenuDrawerLayout({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [activeId, setActiveId] = React.useState<string>("dashboard");
  const { data: session } = useSession();
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Function to determine active menu item based on current path
  const getActiveMenuItem = (path: string): string => {
    const routes = Object.fromEntries(
      menuItems.map((item) => [item.href, item.id])
    );

    return (
      Object.entries(routes).find(
        ([route]) => path === route || (route !== "/" && path.startsWith(route))
      )?.[1] || "dashboard"
    );
  };

  // Update active menu item when pathname changes
  React.useEffect(() => {
    const newActiveId = getActiveMenuItem(pathname);
    setActiveId(newActiveId);
  }, [pathname]);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = () => {
    router.push("/products/newproducts");
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <MenuDrawer
        expanded={expanded}
        onExpandedChange={setExpanded}
        activeItemId={activeId}
        onActiveItemChange={(id) => id && setActiveId(id)}
        className="border-r"
      >
        <MenuDrawerHeader>
          <Logo expanded={expanded} />
          {<MenuDrawerToggle />}
        </MenuDrawerHeader>

        <MenuDrawerContent>
          {menuItems.map((item) => (
            <MenuDrawerItem
              key={item.id}
              id={item.id}
              icon={<item.icon className="h-5 w-5" />}
              href={item.href}
            >
              {item.label}
            </MenuDrawerItem>
          ))}
        </MenuDrawerContent>

        <MenuDrawerFooter
          className={expanded ? "px-4 py-2" : "px-2 py-2 flex justify-center"}
        >
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            {expanded && "Logout"}
          </Button>
        </MenuDrawerFooter>
      </MenuDrawer>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            {/* <Button variant="ghost" className="text-red-500 font-medium">
              Dashboard
            </Button>
            <Button variant="ghost">Orders</Button>
            <Button variant="ghost">Earnings</Button> */}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={handleClick}
              variant="outline"
              className="bg-red-600 text-white flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add new
            </Button>
            <CommandMenu />
            {/* <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button> */}

            {/* User Profile Section */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                {session?.user?.image ? (
                  <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                    {session?.user?.name?.[0] || "U"}
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-64 bg-white rounded-lg shadow-lg py-2 z-50 border">
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center space-x-3 mb-2">
                      {session?.user?.image ? (
                        <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                          {session?.user?.name?.[0] || "U"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session?.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                      Role: {session?.user?.roleId || "User"}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
