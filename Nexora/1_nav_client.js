// Nexora/1_nav_client.js — bottom tabs for client role (safe)
import { t as tr } from "@core/i18n.js";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ExploreBusinessesScreen, MyBookingsScreen, SettingsScreen } from "@screens/index.js";
import { useTheme } from "@ui/index.js";
import {
  IconDashboard as IconExplore,
  IconAgenda as IconMy,
  IconSettings
} from "@ui/index.js";
import React from "react";

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
  <Tab.Screen name="explore"  component={ExploreBusinessesScreen} options={{ title: tr('explore'),     tabBarIcon: IconExplore }} />
  <Tab.Screen name="my"       component={MyBookingsScreen}       options={{ title: tr('my_bookings'), tabBarIcon: IconMy }} />
  <Tab.Screen name="settings" component={SettingsScreen}         options={{ title: tr('settings_title'),     tabBarIcon: IconSettings }} />
    </Tab.Navigator>
  );
}
