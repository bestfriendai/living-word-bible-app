/**
 * Convenience hook that combines theme context with color utilities
 */
import { useTheme } from "@/contexts/ThemeContext";

export function useAppTheme() {
  const { themeMode, isDark, setThemeMode, toggleTheme } = useTheme();

  return {
    themeMode,
    isDark,
    isLight: !isDark,
    setThemeMode,
    toggleTheme,
  };
}
