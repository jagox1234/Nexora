// Nexora/1_nav_business.js — bottom tabs for business role (safe)
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "./4_ui_theme";

import {
  IconDashboard,
  IconServices,
  IconAgenda,
  IconInbox,
  IconSettings,
  IconClients
} from "./4_ui_icons";

import DashboardScreen from "./5_dashboard_screen";
import ServicesScreen from "./5_services_screen";
import InboxScreen from "./5_inbox_screen";
import SettingsScreen from "./5_settings_screen";
import AgendaList from "./5_agenda_list";
import BookingCreate from "./5_booking_create";
import ClientsScreen from "./5_clients_screen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AgendaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="agenda_list" component={AgendaList} />
      <Stack.Screen name="booking_create" component={BookingCreate} />
    </Stack.Navigator>
  );
}

export default function BusinessTabs() {
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
      <Tab.Screen name="dashboard" component={DashboardScreen} options={{ title: "Dashboard", tabBarIcon: IconDashboard, headerShown: false }} />
      <Tab.Screen name="services"  component={ServicesScreen}  options={{ title: "Services",  tabBarIcon: IconServices }} />
      <Tab.Screen name="agenda"    component={AgendaStack}     options={{ title: "Agenda",     tabBarIcon: IconAgenda, headerShown: false }} />
      <Tab.Screen name="clients"   component={ClientsScreen}   options={{ title: "Clients",    tabBarIcon: IconClients }} />
      <Tab.Screen name="inbox"     component={InboxScreen}     options={{ title: "Inbox",      tabBarIcon: IconInbox }} />
      <Tab.Screen name="settings"  component={SettingsScreen}  options={{ title: "Settings",   tabBarIcon: IconSettings }} />
    </Tab.Navigator>
  );
}
