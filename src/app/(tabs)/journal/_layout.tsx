import { Stack } from "expo-router";
import React from "react";

export default function JournalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Journal",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "prominent",
        }}
      />
    </Stack>
  );
}
