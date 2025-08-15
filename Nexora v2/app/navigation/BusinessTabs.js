// v2/app/navigation/BusinessTabs.js — migrated
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { t as tr } from '@v2/core/i18n.js';
import { DashboardScreen, ServicesScreen, InboxScreen, SettingsScreen, AgendaList, BookingCreate, ClientsScreen, BusinessManageScreen, StaffManageScreen, AvailabilityScreen, RequestsScreen, AuthScreen, AnalyticsScreen, DataExportScreen, NotificationsCenterScreen, BillingInvoicesScreen, CalendarSyncScreen, AccountingIntegrationScreen, WebhooksScreen } from '@v2/screens/index.js';
import { IconDashboard, IconServices, IconAgenda, IconInbox, IconSettings, IconClients } from '@v2/ui/icons.js';
import { useTheme } from '@v2/ui/theme.js';
import React from 'react';
import { useApp } from '@v2/core/index.js';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AgendaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='agenda_list' component={AgendaList} />
      <Stack.Screen name='booking_create' component={BookingCreate} />
    </Stack.Navigator>
  );
}

function ManageStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name='biz_manage' component={BusinessManageScreen} />
      <Stack.Screen name='staff_manage' component={StaffManageScreen} />
      <Stack.Screen name='availability_manage' component={AvailabilityScreen} />
      <Stack.Screen name='requests_manage' component={RequestsScreen} />
      <Stack.Screen name='auth' component={AuthScreen} />
  {/* Roadmap placeholder screens */}
  <Stack.Screen name='data_export' component={DataExportScreen} />
  <Stack.Screen name='notifications_center' component={NotificationsCenterScreen} />
  <Stack.Screen name='billing_invoices' component={BillingInvoicesScreen} />
  <Stack.Screen name='calendar_sync' component={CalendarSyncScreen} />
  <Stack.Screen name='accounting_integration' component={AccountingIntegrationScreen} />
  <Stack.Screen name='webhooks' component={WebhooksScreen} />
    </Stack.Navigator>
  );
}

export default function BusinessTabs() {
  const t = useTheme();
  const { hasRole } = useApp();
  const isBiz = hasRole('business');
  return (
    <Tab.Navigator screenOptions={{ headerStyle: { backgroundColor: t?.color?.card || '#0f1419' }, headerTintColor: t?.color?.text || '#e5eef5', tabBarActiveTintColor: t?.color?.primary || '#7dd3fc', tabBarInactiveTintColor: t?.color?.muted || '#93a3af', tabBarStyle: { backgroundColor: t?.color?.card || '#0f1419' } }}>
      <Tab.Screen name='dashboard' component={DashboardScreen} options={{ title: tr('dashboard'), tabBarIcon: IconDashboard, headerShown: false }} />
      {isBiz && <Tab.Screen name='services' component={ServicesScreen} options={{ title: tr('services_title'), tabBarIcon: IconServices }} />}
      <Tab.Screen name='agenda' component={AgendaStack} options={{ title: tr('agenda'), tabBarIcon: IconAgenda, headerShown: false }} />
      {isBiz && <Tab.Screen name='clients' component={ClientsScreen} options={{ title: tr('clients_title'), tabBarIcon: IconClients }} />}
      {isBiz && <Tab.Screen name='inbox' component={InboxScreen} options={{ title: tr('inbox'), tabBarIcon: IconInbox }} />}
  {isBiz && <Tab.Screen name='analytics' component={AnalyticsScreen} options={{ title: tr('analytics'), tabBarIcon: IconDashboard }} />}
  {isBiz && <Tab.Screen name='manage' component={ManageStack} options={{ title: 'More', tabBarIcon: IconSettings, headerShown:false }} />}
      <Tab.Screen name='settings' component={SettingsScreen} options={{ title: tr('settings_title'), tabBarIcon: IconSettings }} />
    </Tab.Navigator>
  );
}
