import React, { createContext, useContext, useEffect, useState } from "react"

const initialState = { theme: "system", setTheme: () => {} }
const ThemeProviderContext = createContext(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  )

  useEffect(() => {
    const root = document.documentElement
    const mql = window.matchMedia("(prefers-color-scheme: dark)")

    const apply = () => {
      root.classList.remove("light", "dark")
      if (theme === "system") {
        root.classList.add(mql.matches ? "dark" : "light")
      } else {
        root.classList.add(theme)
      }
    }

    apply()
    if (theme === "system") {
      mql.addEventListener("change", apply)
      return () => mql.removeEventListener("change", apply)
    }
  }, [theme])

  const setTheme = (newTheme) => {
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
