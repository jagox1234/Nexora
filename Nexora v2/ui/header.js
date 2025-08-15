// v2/ui/header.js — migrated UIHeader component
import { React, View, Text, TouchableOpacity } from '@v2/app/baseDependencies.js';
import { useTheme } from '@v2/ui/theme.js';

export default function UIHeader({ title="", subtitle="", onBack, right=null, elevated=true, style, titleStyle, subtitleStyle }) {
  const t = useTheme?.();
  const color = t?.color ?? {}; const spacing = t?.spacing ?? {};
  const bg = color.card ?? '#0f1419'; const text = color.text ?? '#e5eef5'; const muted = color.muted ?? '#93a3af'; const border = color.border ?? '#1f2933';
  const padV = spacing.md ?? 16; const padH = spacing.md ?? 16; const gap = spacing.sm ?? 10;
  return (
    <View style={[{
      backgroundColor: elevated ? 'rgba(18,24,32,0.92)' : bg,
      paddingVertical: padV,
      paddingHorizontal: padH,
      borderBottomWidth: 0,
      borderRadius: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#38bdf8',
      shadowOpacity: elevated ? 0.22 : 0.08,
      shadowRadius: elevated ? 16 : 6,
      shadowOffset: { width: 0, height: elevated ? 6 : 2 },
      elevation: elevated ? 6 : 2,
      margin: 8,
    }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: gap }}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={{ marginRight: gap }} activeOpacity={0.8}>
            <View style={{ borderWidth: 1, borderColor: border, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: 'rgba(56,189,248,0.08)' }}>
              <Text style={{ color: text, fontWeight: '700', fontSize: 18 }}>‹</Text>
            </View>
          </TouchableOpacity>
        ) : null}
        <View style={{ flexShrink: 1 }}>
          {!!title && (<Text numberOfLines={1} style={[{ color: text, fontSize: 22, fontWeight: '800', letterSpacing: 0.5 }, titleStyle]}>{title}</Text>)}
          {!!subtitle && (<Text numberOfLines={1} style={[{ color: muted, marginTop: 2, fontSize: 15 }, subtitleStyle]}>{subtitle}</Text>)}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap }}>{right}</View>
    </View>
  );
}
