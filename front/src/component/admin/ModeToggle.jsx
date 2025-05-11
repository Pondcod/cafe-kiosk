import React from "react"
import { Sun, Moon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"   // ← use your ui library’s exports
import { Button } from "@/components/ui/button"
import { useTheme } from "./ThemeProvider.jsx"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Toggle theme"
          className="relative"
        >
          <Sun
            className={
              "h-5 w-5 transition-transform mx-auto " +
              (theme === "light"
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 -rotate-90 scale-50")
            }
          />
          <Moon
            className={
              "absolute h-5 w-5 transition-transform " +
              (theme === "dark"
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 rotate-90 scale-50")
            }
          />
        </Button>
      </DropdownMenuTrigger>

      {/* mounts to document.body so it won’t be clipped */}
      <DropdownMenuContent sideOffset={4} align="end">
        <DropdownMenuItem onSelect={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
