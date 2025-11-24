import React from 'react';
import { Stack } from "expo-router";
import { LanguageProvider } from "../utils/LanguageContext";
import { LinearGradient } from 'expo-linear-gradient';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTransparent: true,
          headerStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#eef8ff',
          headerTitleStyle: { color: '#eef8ff' },
          headerBackground: () => (
            <LinearGradient
              colors={["#07142a", "#0e2744"]}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          ),
        }}
      />
    </LanguageProvider>
  );
}
