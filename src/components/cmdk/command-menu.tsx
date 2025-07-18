"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { menuItems } from "@/components/common/menu-drawer/menu";
import { useHotkeys } from "react-hotkeys-hook";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setOpen((open) => !open);
  });

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    []
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
      >
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search</span>
        <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {menuItems.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => runCommand(() => router.push(item.href))}
                onClick={() => runCommand(() => router.push(item.href))}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
                {item.description && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
} 