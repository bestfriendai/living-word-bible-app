import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import React from "react";
import { ColorValue, ImageSourcePropType, Platform } from "react-native";

import { theme } from "@/theme";
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
    light: "#8E8E93",
    dark: "#8E8E93",
  });

  // Individual colors for each tab
  const homeColor = "#667eea";
  const scriptureColor = "#3b82f6";
  const devotionalColor = "#fb923c";
  const prayerColor = "#ec4899";
  const prayerBuddyColor = "#a855f7";

  const labelSelectedStyle =
    Platform.OS === "ios"
      ? { fontSize: 13, fontWeight: "600" as const }
      : { fontSize: 15 };

  const labelStyle = {
    color: inactiveTintColor,
    fontSize: 12,
    fontWeight: "500" as const,
  };

  return (
    <NativeTabs
      badgeBackgroundColor={tintColor}
      labelStyle={labelStyle}
      iconColor={inactiveTintColor}
      tintColor={inactiveTintColor}
      labelVisibilityMode="labeled"
      indicatorColor="transparent"
      disableTransparentOnScrollEdge={true}
    >
      <NativeTabs.Trigger name="(home)">
        {Platform.select({
          ios: <Icon sf="house" selectedColor={homeColor} />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons as VectorIconFamily}
                  name="home-heart-outline"
                />
              }
              selectedColor={homeColor}
            />
          ),
        })}
        <Label selectedStyle={{ ...labelSelectedStyle, color: homeColor }}>
          Home
        </Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="scripture">
        {Platform.select({
          ios: <Icon sf="book" selectedColor={scriptureColor} />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons as VectorIconFamily}
                  name="book-open-outline"
                />
              }
              selectedColor={scriptureColor}
            />
          ),
        })}
        <Label selectedStyle={{ ...labelSelectedStyle, color: scriptureColor }}>
          Scripture
        </Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="devotional">
        {Platform.select({
          ios: <Icon sf="heart.circle" selectedColor={devotionalColor} />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons as VectorIconFamily}
                  name="meditation"
                />
              }
              selectedColor={devotionalColor}
            />
          ),
        })}
        <Label
          selectedStyle={{ ...labelSelectedStyle, color: devotionalColor }}
        >
          Devotional
        </Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="journal">
        {Platform.select({
          ios: <Icon sf="hand.raised" selectedColor={prayerColor} />,
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons as VectorIconFamily}
                  name="hand-heart-outline"
                />
              }
              selectedColor={prayerColor}
            />
          ),
        })}
        <Label selectedStyle={{ ...labelSelectedStyle, color: prayerColor }}>
          Journal
        </Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="prayer-buddy">
        {Platform.select({
          ios: (
            <Icon
              sf="bubble.left.and.bubble.right"
              selectedColor={prayerBuddyColor}
            />
          ),
          android: (
            <Icon
              src={
                <VectorIcon
                  family={MaterialCommunityIcons as VectorIconFamily}
                  name="robot-happy-outline"
                />
              }
              selectedColor={prayerBuddyColor}
            />
          ),
        })}
        <Label
          selectedStyle={{
            ...labelSelectedStyle,
            color: prayerBuddyColor,
          }}
        >
          AI Buddy
        </Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
