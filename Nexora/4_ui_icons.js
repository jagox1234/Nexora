// Nexora/4_ui_icons.js — safe minimal SVG icons for tabs
import React from "react";

import { Svg, Path, Circle, Rect } from "./2_dependencies.js";

function withTabIcon(Component) {
  const Wrapped = ({ color, size, focused }) => (
    <Component color={color || (focused ? "#7dd3fc" : "#93a3af")} size={size || 22} focused={focused} />
  );
  Wrapped.displayName = `WithTabIcon(${Component.name || 'Icon'})`;
  return Wrapped;
}

function _IconDashboard({ color = "#93a3af", size = 22 }) {
  const s = size, r = s * 0.18, gap = s * 0.12;
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Rect x={0} y={0} width={r} height={r} rx={2} fill={color} />
      <Rect x={r+gap} y={0} width={r} height={r} rx={2} fill={color} />
      <Rect x={0} y={r+gap} width={r} height={r} rx={2} fill={color} />
      <Rect x={r+gap} y={r+gap} width={r} height={r} rx={2} fill={color} />
    </Svg>
  );
}

function _IconServices({ color = "#93a3af", size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 17l4-4 2 2-4 4H3v-2zM14.7 3.3a4 4 0 015.657 5.657l-5.657 5.657a3 3 0 01-2.121.879H10l-2-2v-2.576a3 3 0 01.879-2.121L14.7 3.3z" fill={color} />
    </Svg>
  );
}

function _IconAgenda({ color = "#93a3af", size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M8 2v4M16 2v4M3 10h18" stroke={color} strokeWidth="2" />
      <Rect x="7" y="13" width="3" height="3" fill={color} rx="0.5" />
      <Rect x="12" y="13" width="3" height="3" fill={color} rx="0.5" />
      <Rect x="17" y="13" width="3" height="3" fill={color} rx="0.5" />
    </Svg>
  );
}

function _IconInbox({ color = "#93a3af", size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 4h16v10a4 4 0 01-4 4H10l-4 4v-4H4V4z" fill={color} opacity="0.15" />
      <Path d="M4 4h16v10a4 4 0 01-4 4H10l-4 4v-4H4V4z" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}

function _IconSettings({ color = "#93a3af", size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9 4a7 7 0 01-.07.99l2.02 1.57-2 3.46-2.39-.53a7.05 7.05 0 01-1.71.99L16 22h-4l-.85-2.04a7.05 7.05 0 01-1.71-.99l-2.39.53-2-3.46 2.02-1.57A7 7 0 016 12c0-.34.02-.67.07-.99L4.05 9.44l2-3.46 2.39.53c.53-.42 1.11-.76 1.71-.99L12 2h4l.85 2.04c.6.23 1.18.57 1.71.99l2.39-.53 2 3.46-2.02 1.57c.05.32.07.65.07.99z" fill={color} />
    </Svg>
  );
}

function _IconClients({ color = "#93a3af", size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="8" cy="8" r="3" stroke={color} strokeWidth="2" fill="none" />
      <Circle cx="16" cy="8" r="3" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M3 20c1-3 4-5 7-5s6 2 7 5" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  );
}

export const IconDashboard = withTabIcon(_IconDashboard);
export const IconServices  = withTabIcon(_IconServices);
export const IconAgenda    = withTabIcon(_IconAgenda);
export const IconInbox     = withTabIcon(_IconInbox);
export const IconSettings  = withTabIcon(_IconSettings);
export const IconClients   = withTabIcon(_IconClients);

export default { IconDashboard, IconServices, IconAgenda, IconInbox, IconSettings, IconClients };
