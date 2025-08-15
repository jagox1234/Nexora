// v2/app/navigation/AppNavigation.js — migrated root navigation
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useApp } from '@v2/core/index.js';
import { RoleSelectScreen } from '@v2/screens/index.js';
import { useTheme } from '@v2/ui/theme.js';
import React, { Suspense } from 'react';

import BusinessTabs from './BusinessTabs.js';
import ClientTabs from './ClientTabs.js';


export default function AppNavigation() {
  const { role } = useApp();
  const t = useTheme();
  const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: t.color?.bg || '#0b0f13', card: t.color?.card || '#0f1419', text: t.color?.text || '#e5eef5', border: t.color?.border || '#1f2933', primary: t.color?.primary || '#7dd3fc', notification: t.color?.info || '#38bdf8' } };
  return (
    <NavigationContainer theme={navTheme}>
      <Suspense fallback={null}>
        {role === 'business' ? <BusinessTabs /> : role === 'client' ? <ClientTabs /> : <RoleSelectScreen />}
      </Suspense>
    </NavigationContainer>
  );
}
