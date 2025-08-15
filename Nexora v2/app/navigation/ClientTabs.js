// v2/app/navigation/ClientTabs.js — migrated
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { t as tr } from '@v2/core/i18n.js';
import { ExploreBusinessesScreen, MyBookingsScreen, SettingsScreen } from '@v2/screens/index.js';
import { IconDashboard as IconExplore, IconAgenda as IconMy, IconSettings } from '@v2/ui/icons.js';
import { useTheme } from '@v2/ui/theme.js';
import React from 'react';

const Tab = createBottomTabNavigator();

export default function ClientTabs() {
  const t = useTheme();
  return (
    <Tab.Navigator screenOptions={{ headerStyle: { backgroundColor: t?.color?.card || '#0f1419' }, headerTintColor: t?.color?.text || '#e5eef5', tabBarActiveTintColor: t?.color?.primary || '#7dd3fc', tabBarInactiveTintColor: t?.color?.muted || '#93a3af', tabBarStyle: { backgroundColor: t?.color?.card || '#0f1419' } }}>
      <Tab.Screen name='explore' component={ExploreBusinessesScreen} options={{ title: tr('explore'), tabBarIcon: IconExplore }} />
      <Tab.Screen name='my' component={MyBookingsScreen} options={{ title: tr('my_bookings'), tabBarIcon: IconMy }} />
      <Tab.Screen name='settings' component={SettingsScreen} options={{ title: tr('settings_title'), tabBarIcon: IconSettings }} />
    </Tab.Navigator>
  );
}
