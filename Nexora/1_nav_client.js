// Nexora/1_nav_client.js — bottom tabs for client role (safe)
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "./4_ui_theme.js";

import {
  IconDashboard as IconExplore,
  IconAgenda as IconMy,
  IconSettings
} from "./4_ui_icons";

import ExploreBusinessesScreen from "./5_explore_businesses.js";
import MyBookingsScreen from "./5_my_bookings_screen.js";
import SettingsScreen from "./5_settings_screen.js";

const Tab = createBottomTabNavigator();

export default function ClientTabs() {
  const t = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: t?.color?.card || "#0f1419" },
        headerTintColor: t?.color?.text || "#e5eef5",
        tabBarActiveTintColor: t?.color?.primary || "#7dd3fc",
        tabBarInactiveTintColor: t?.color?.muted || "#93a3af",
        tabBarStyle: { backgroundColor: t?.color?.card || "#0f1419" }
      }}
    >
      <Tab.Screen name="explore"  component={ExploreBusinessesScreen} options={{ title: "Explore",     tabBarIcon: IconExplore }} />
      <Tab.Screen name="my"       component={MyBookingsScreen}       options={{ title: "My bookings", tabBarIcon: IconMy }} />
      <Tab.Screen name="settings" component={SettingsScreen}         options={{ title: "Settings",     tabBarIcon: IconSettings }} />
    </Tab.Navigator>
  );
}
