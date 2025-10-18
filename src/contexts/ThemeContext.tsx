import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@living_word_theme_mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine if we're in dark mode
  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark");

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
      console.log(`🎨 Theme changed to: ${mode}`);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  // Toggle between light and dark (not system)
  const toggleTheme = () => {
    const newMode = isDark ? "light" : "dark";
    setThemeMode(newMode);
  };

  // Don't render children until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
