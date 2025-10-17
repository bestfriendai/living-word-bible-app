import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { usePathname, useRouter } from "expo-router";
import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { Platform, StyleSheet, useColorScheme } from "react-native";
import { setBackgroundColorAsync } from "expo-system-ui";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import * as SplashScreen from "expo-splash-screen";

import { theme } from "../theme";

import { useThemeColor } from "@/components/Themed";
import { osName } from "expo-device";
import { bibleDatabase } from "@/services/bibleDatabase";
import { bibleApiService } from "@/services/bibleApiService";
import { logEnvValidation } from "@/utils/validateEnv";

SplashScreen.setOptions({
  duration: 200,
  fade: true,
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Layout() {
  const router = useRouter();
  const pathName = usePathname();
  const colorScheme = useColorScheme() || "light";

  const tabBarBackgroundColor = useThemeColor(theme.color.background);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync(
        colorScheme === "light" ? "dark" : "light",
      );
    }
  }, [colorScheme]);

  // Keep the root view background color in sync with the current theme
  useEffect(() => {
    setBackgroundColorAsync(
      colorScheme === "dark"
        ? theme.color.background.dark
        : theme.color.background.light,
    );
  }, [colorScheme]);

  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.actionIdentifier ===
        Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      try {
        const url = lastNotificationResponse.notification.request.content.data
          .url as string;
        if (url && pathName !== url) {
          router.push(url);
        }
      } catch {}
    }
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastNotificationResponse]);

  // Validate environment variables and initialize Bible database on app start
  useEffect(() => {
    // Validate environment variables
    logEnvValidation();

    const initializeBible = async () => {
      try {
        await bibleDatabase.initialize();
        // Seed popular verses for offline access
        await bibleApiService.seedPopularVerses();
        console.log("✅ Bible database ready");
      } catch (error) {
        console.error("❌ Failed to initialize Bible database:", error);
      }
    };

    initializeBible();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ActionSheetProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </ThemeProvider>
      </ActionSheetProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
