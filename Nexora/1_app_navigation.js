// Nexora/1_app_navigation.js — role switch + navigation container
import { useApp } from "@core/index.js";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { useTheme } from "@ui/index.js";
import React from "react";
import { Suspense } from 'react';
const BusinessTabs = React.lazy(() => import('@app/BusinessTabs.js'));
const ClientTabs = React.lazy(() => import('@app/ClientTabs.js'));
import { RoleSelectScreen } from "@screens/index.js";

export default function AppNavigation() {
  const { role } = useApp();
  const t = useTheme();

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: t.color?.bg || "#0b0f13",
      card: t.color?.card || "#0f1419",
      text: t.color?.text || "#e5eef5",
      border: t.color?.border || "#1f2933",
      primary: t.color?.primary || "#7dd3fc",
      notification: t.color?.info || "#38bdf8"
    }
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Suspense fallback={null}>
        {role === "business" ? <BusinessTabs /> : role === "client" ? <ClientTabs /> : <RoleSelectScreen />}
      </Suspense>
    </NavigationContainer>
  );
}
