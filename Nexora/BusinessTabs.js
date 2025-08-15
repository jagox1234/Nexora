// BusinessTabs.js — formerly 1_nav_business.js (renamed for cleanliness)
import { t as tr } from '@core/i18n.js';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen, ServicesScreen, InboxScreen, SettingsScreen, AgendaList, BookingCreate, ClientsScreen } from '@screens/index.js';
import { useTheme } from '@ui/index.js';
import { IconDashboard, IconServices, IconAgenda, IconInbox, IconSettings, IconClients } from '@ui/index.js';
import React from 'react';

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
        headerStyle: { backgroundColor: t?.color?.card || '#0f1419' },
        headerTintColor: t?.color?.text || '#e5eef5',
        tabBarActiveTintColor: t?.color?.primary || '#7dd3fc',
        tabBarInactiveTintColor: t?.color?.muted || '#93a3af',
        tabBarStyle: { backgroundColor: t?.color?.card || '#0f1419' },
      }}
    >
      <Tab.Screen name="dashboard" component={DashboardScreen} options={{ title: tr('dashboard'), tabBarIcon: IconDashboard, headerShown: false }} />
      <Tab.Screen name="services" component={ServicesScreen} options={{ title: tr('services_title'), tabBarIcon: IconServices }} />
      <Tab.Screen name="agenda" component={AgendaStack} options={{ title: tr('agenda'), tabBarIcon: IconAgenda, headerShown: false }} />
      <Tab.Screen name="clients" component={ClientsScreen} options={{ title: tr('clients_title'), tabBarIcon: IconClients }} />
      <Tab.Screen name="inbox" component={InboxScreen} options={{ title: tr('inbox'), tabBarIcon: IconInbox }} />
      <Tab.Screen name="settings" component={SettingsScreen} options={{ title: tr('settings_title'), tabBarIcon: IconSettings }} />
    </Tab.Navigator>
  );
}
