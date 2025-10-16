import { Stack } from "expo-router";
import React from "react";

export default function ScriptureLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Scripture",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "prominent",
        }}
      />
    </Stack>
  );
}
