import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Badge,
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import React from "react";
import {
  ColorValue,
  ImageSourcePropType,
  Platform,
  // eslint-disable-next-line react-native/split-platform-components
  DynamicColorIOS,
} from "react-native";

import { theme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useThemeColor } from "@/components/Themed";

// Todo (betomoedano): In the future we can remove this type. Learn more: https://exponent-internal.slack.com/archives/C0447EFTS74/p1758042759724779?thread_ts=1758039375.241799&cid=C0447EFTS74
type VectorIconFamily = {
  getImageSource: (
    name: string,
    size: number,
    color: ColorValue,
  ) => Promise<ImageSourcePropType>;
};

export default function TabLayout() {
  const tintColor = useThemeColor(theme.color.reactBlue);
  const inactiveTintColor = useThemeColor({
    light: "#00000090",
    dark: "#FFFFFF90",
  });

  const labelSelectedStyle =
    Platform.OS === "ios" ? { color: tintColor } : undefined;

  return (
    <NativeTabs
      badgeBackgroundColor={tintColor}
      labelStyle={{
        color:
          Platform.OS === "ios" && isLiquidGlassAvailable()
            ? DynamicColorIOS({
                light: theme.colorBlack,
                dark: theme.colorWhite,
              })
            : inactiveTintColor,
      }}
      iconColor={
        Platform.OS === "ios" && isLiquidGlassAvailable()
          ? DynamicColorIOS({
              light: theme.colorBlack,
              dark: theme.colorWhite,
            })
          : inactiveTintColor
      }
      tintColor={
        Platform.OS === "ios"
          ? DynamicColorIOS(theme.color.reactBlue)
          : inactiveTintColor
      }
      labelVisibilityMode="labeled"
      indicatorColor={tintColor + "25"}
      disableTransparentOnScrollEdge={true}
    >
      <NativeTabs.Trigger name="(home)">
        {Platform.select({
          ios: <Icon sf="house.fill" />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons as VectorIconFamily}
                  name="home"
                />
              }
              selectedColor={tintColor}
            />
          ),
        })}
        <Label selectedStyle={labelSelectedStyle}>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="scripture"
        role={isLiquidGlassAvailable() ? "search" : undefined}
      >
        {Platform.select({
          ios: <Icon sf="book.fill" selectedColor={tintColor} />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons as VectorIconFamily}
                  name="book-open-variant"
                />
              }
              selectedColor={tintColor}
            />
          ),
        })}
        <Label selectedStyle={labelSelectedStyle}>Scripture</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="devotional">
        {Platform.select({
          ios: <Icon sf="sun.max.fill" />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons as VectorIconFamily}
                  name="white-balance-sunny"
                />
              }
              selectedColor={tintColor}
            />
          ),
        })}
        <Label selectedStyle={labelSelectedStyle}>Devotional</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="journal">
        {Platform.select({
          ios: <Icon sf="note.text" selectedColor={tintColor} />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons as VectorIconFamily}
                  name="notebook"
                />
              }
              selectedColor={tintColor}
            />
          ),
        })}
        <Label selectedStyle={labelSelectedStyle}>Journal</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
