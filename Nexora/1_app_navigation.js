// Nexora/1_app_navigation.js — role switch + navigation container
import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";

import { useApp } from "./3_core_index.js";
import { useTheme } from "./4_ui_theme.js";

import BusinessTabs from "./1_nav_business.js";
import ClientTabs from "./1_nav_client.js";
import RoleSelectScreen from "./5_role_select_screen.js";

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
      {role === "business" ? <BusinessTabs /> : role === "client" ? <ClientTabs /> : <RoleSelectScreen />}
    </NavigationContainer>
  );
}
