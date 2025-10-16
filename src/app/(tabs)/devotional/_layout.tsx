import { Stack } from "expo-router";
import React from "react";

export default function DevotionalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Devotional",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "prominent",
        }}
      />
    </Stack>
  );
}
