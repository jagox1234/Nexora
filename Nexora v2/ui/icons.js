// v2/ui/icons.js — Ionicons fallback (avoids react-native-svg web crash)
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

import { useTheme } from './theme.js';

const wrap = (name) => {
	const C = ({ size=24, color }) => {
		const t = useTheme();
		const accent = t?.color?.primaryAlt || '#263238';
		return <Ionicons name={name} size={size} color={color || accent} style={{ shadowColor: accent, shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }} />;
	};
	C.displayName = name;
	return C;
};

export const IconDashboard = wrap('grid-outline');
export const IconServices  = wrap('list-outline');
export const IconAgenda    = wrap('calendar-outline');
export const IconInbox     = wrap('mail-unread-outline');
export const IconSettings  = wrap('settings-outline');
export const IconClients   = wrap('people-outline');

export default { IconDashboard, IconServices, IconAgenda, IconInbox, IconSettings, IconClients };
