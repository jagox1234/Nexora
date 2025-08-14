// Nexora/4_ui_theme.js — theme provider and hook
import { React, createContext, useContext, useState, useMemo } from "./2_dependencies";

const ThemeContext = createContext();

const baseSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const baseRadius = {
  sm: 6,
  md: 10,
  lg: 14,
};

const lightColors = {
  background: "#f5f6f7",
  card: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
  border: "#d1d5db",
  primary: "#2563eb",
  danger: "#dc2626",
  success: "#16a34a",
};

const darkColors = {
  background: "#0f1419",
  card: "#1f2933",
  text: "#f3f4f6",
  muted: "#9ca3af",
  border: "#374151",
  primary: "#3b82f6",
  danger: "#f87171",
  success: "#4ade80",
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value = useMemo(() => {
    const color = mode === "light" ? lightColors : darkColors;
    return {
      mode,
      toggleMode,
      color,
      spacing: baseSpacing,
      radius: baseRadius,
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
