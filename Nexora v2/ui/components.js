// v2/ui/components.js — shared UI components (migrated)
import { React, View, Text, ScrollView, TextInput as RNTextInput, TouchableOpacity, LinearGradient, SafeAreaView, ActivityIndicator } from '../app/dependencies.js';

import UIHeader from './header.js';
import { useTheme } from './theme.js';

// Bridge hook to central theme tokens ensuring backward compatibility for existing components
export const useColors = () => {
	const t = useTheme?.();
	const c = t?.color || {};
	return {
		bg: c.background || '#111',
		card: c.card || '#1f1f1f',
		text: c.text || '#fff',
		muted: c.muted || '#888',
		border: c.border || '#333',
		primary: c.primary || '#3b82f6',
		primaryAlt: c.primaryAlt || c.accentAlt || '#1d4ed8',
		success: c.success || '#16a34a',
		danger: c.danger || '#dc2626',
		warning: c.warning || '#d97706',
		info: c.info || '#0284c7',
		gradientStart: c.gradientStart || c.background,
		gradientEnd: c.gradientEnd || c.card,
	};
};
export const useSpacing = () => {
	const t = useTheme?.();
	return { xs: t?.spacing?.xs ?? 6, sm: t?.spacing?.sm ?? 10, md: t?.spacing?.md ?? 16, lg: t?.spacing?.lg ?? 20, xl: t?.spacing?.xl ?? 28 };
};

export function Screen({ children, scroll = false, style, contentContainerStyle, gradient=false, maxWidth=720, center=true, loading=false, ...props }) {
	const C = scroll ? ScrollView : View; const c = useColors(); const s = useSpacing();
	const containerStyle = [ { flex:1, padding:s.md }, style ];
	const innerContent = (
		<C
			style={containerStyle}
			contentContainerStyle={[scroll && { paddingBottom:s.lg }, contentContainerStyle]}
			{...props}
		>
			<View style={[ center && { width:'100%', maxWidth, alignSelf:'center' } ]}>
				{loading ? <View style={{ paddingVertical:64, alignItems:'center', justifyContent:'center' }}><Spinner /></View> : children}
			</View>
		</C>
	);
	const body = gradient ? (
		<LinearGradient colors={[c.gradientStart || c.bg, c.bg, c.primaryAlt]} start={{ x:0, y:0 }} end={{ x:1, y:1 }} style={{ flex:1 }}>
			{innerContent}
		</LinearGradient>
	) : (
		<View style={{ flex:1, backgroundColor:c.bg }}>
			{innerContent}
		</View>
	);
	return (
		<SafeAreaView style={{ flex:1 }}>
			{body}
		</SafeAreaView>
	);
}
export function Card({ children, style }) {
	const c = useColors();
	const s = useSpacing();
	return (
		<View style={[{
			backgroundColor: c.card,
			borderColor: c.border,
			borderWidth: 1,
			borderRadius: 18,
			padding: s.md,
			marginBottom: s.sm,
			shadowColor: '#000',
			shadowOpacity: 0.12,
			shadowRadius: 8,
			shadowOffset: { width: 0, height: 2 },
			elevation: 3,
		}, style]}>
			{children}
		</View>
	);
}
export function H1({ children, style }) { const c=useColors(); const s=useSpacing(); return <Text style={[{ color:c.text, fontSize:24, fontWeight:'800', letterSpacing:0.5, marginBottom:s.md }, style]}>{children}</Text>; }
export function H2({ children, style }) { const c=useColors(); const s=useSpacing(); return <Text style={[{ color:c.text, fontSize:18, fontWeight:'700', marginBottom:s.sm }, style]}>{children}</Text>; }
export function P({ children, muted=false, size='md', style }) { const c=useColors(); const fontSize = size==='sm'?12:size==='lg'?16:14; return <Text style={[{ color: muted? c.muted:c.text, fontSize }, style]}>{children}</Text>; }
export function Row({ children, gap=1, align='stretch', justify='flex-start', wrap=false, style }) {
	const gapPx = typeof gap === 'number' ? gap*8 : 8;
	const total = React.Children.count(children);
	return (
		<View style={[{ flexDirection:'row', alignItems:align, justifyContent:justify, flexWrap: wrap? 'wrap':'nowrap' }, style]}>
			{React.Children.map(children,(child,idx)=>(
				<View style={{ marginRight: (idx < total-1) ? gapPx:0, marginBottom: wrap? gapPx:0 }}>
					{child}
				</View>
			))}
		</View>
	);
}
// Responsive breakpoint hook (simple width-based for web & native)
export function useBreakpoint() {
	const [w, setW] = React.useState(0);
	const onLayout = React.useCallback(e => { const width = e?.nativeEvent?.layout?.width; if (width) setW(width); }, []);
	const bp = w < 480 ? 'xs' : w < 760 ? 'sm' : w < 1024 ? 'md' : 'lg';
	return { width:w, bp, onLayout, isXS: bp==='xs', isSM: bp==='sm', isMD: bp==='md', isLG: bp==='lg' };
}
// Grid: automatic column layout based on breakpoint or explicit cols
export function Grid({ children, gap=1, minColWidth=180, maxCols, style }) {
	const { onLayout, width } = useBreakpoint();
	const gapPx = (typeof gap==='number'? gap:1)*8;
	const colCount = React.useMemo(()=> {
		if (!width) return 1;
		const tentative = Math.max(1, Math.floor((width + gapPx) / (minColWidth + gapPx)));
		return maxCols ? Math.min(tentative, maxCols) : tentative;
	}, [width, minColWidth, maxCols, gapPx]);
	const itemStyle = { width: `${100/colCount}%`, paddingRight: gapPx, marginBottom: gapPx };
	const arr = React.Children.toArray(children);
	return (
		<View onLayout={onLayout} style={[{ flexDirection:'row', flexWrap:'wrap', marginRight:-gapPx }, style]}>
			{arr.map((child,i)=>(<View key={i} style={itemStyle}>{child}</View>))}
		</View>
	);
}
export function Spacer({ h=1 }) { const base=8; return <View style={{ height:h*base }} />; }
export function Divider({ style }) { const c=useColors(); return <View style={[{ height:1, backgroundColor:c.border, opacity:0.8, marginVertical:8 }, style]} />; }
export function SectionTitle({ children, right, style }) { const c=useColors(); return (
	<View style={[{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8 }, style]}>
		<Text style={{ color:c.text, fontSize:15, fontWeight:'700', letterSpacing:0.5 }}>{children}</Text>
		{right}
	</View>
); }
export function Input({ style, ...props }) {
	const c = useColors();
	const s = useSpacing();
	return (
		<RNTextInput
			placeholderTextColor={c.muted}
			style={[{
				backgroundColor: c.bg,
				color: c.text,
				borderWidth: 1,
				borderColor: c.border,
				borderRadius: 14,
				paddingHorizontal: s.lg,
				paddingVertical: 14,
				marginBottom: s.sm,
				fontSize: 15,
				shadowColor: '#38bdf8',
				shadowOpacity: 0.10,
				shadowRadius: 6,
				shadowOffset: { width: 0, height: 1 },
				elevation: 1,
			}, style]}
			{...props}
		/>
	);
}
export function NumberInput({ value, onChangeNumber, ...props }) {
	return <Input keyboardType='numeric' value={String(value ?? '')} onChangeText={txt => onChangeNumber?.(Number(txt.replace(/[^0-9.]/g,'')))} {...props} />;
}
export function Button({ title, onPress, variant='primary', size='md', style, textStyle, disabled=false, accessibilityLabel, accessibilityHint }) {
		const c = useColors();
		const padV = size === 'sm' ? 8 : 14;
		const padH = size === 'sm' ? 14 : 20;
		let bg = c.primary, bd = c.primary, fg = '#0b0f13';
		if (variant === 'outline') { bg = 'transparent'; bd = c.border; fg = c.text; }
		else if (variant === 'danger') { bg = c.danger; bd = c.danger; fg = '#fff'; }
		else if (variant === 'ghost') { bg = 'transparent'; bd = 'transparent'; fg = c.text; }
		else if (variant === 'success') { bg = c.success; bd = c.success; fg = '#fff'; }
		else if (variant === 'warning') { bg = c.warning; bd = c.warning; fg = '#000'; }
		const opacity = disabled ? 0.5 : 1;
		return (
			<TouchableOpacity
				onPress={onPress}
				disabled={disabled}
				activeOpacity={0.7}
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel || title}
				accessibilityHint={accessibilityHint}
				accessibilityState={{ disabled }}
				style={{ borderRadius: 16 }}
			>
				<View style={[{
					opacity,
					backgroundColor: bg,
					borderColor: bd,
					borderWidth: variant === 'outline' ? 1 : bg === 'transparent' ? 0 : 1,
					paddingVertical: padV,
					paddingHorizontal: padH,
					borderRadius: 16,
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: 44,
					minWidth: 44,
					shadowColor: bg !== 'transparent' ? '#38bdf8' : undefined,
					shadowOpacity: bg !== 'transparent' ? 0.18 : 0,
					shadowRadius: bg !== 'transparent' ? 8 : 0,
					shadowOffset: bg !== 'transparent' ? { width: 0, height: 2 } : { width: 0, height: 0 },
					elevation: bg !== 'transparent' ? 2 : 0,
					transform: [{ scale: disabled ? 1 : 0.98 }],
				}, style]}>
					<Text style={[{ color: fg, fontWeight: '700', fontSize: 16, letterSpacing: 0.5 }, textStyle]}>{title}</Text>
				</View>
			</TouchableOpacity>
		);
}
// Badge component for small status labels
export function Badge({ label, variant='default', style, textStyle }) {
	const c = useColors();
	let bg = c.card, fg = c.text, bd = c.border;
	if (variant === 'info') { bg = c.info; fg = '#fff'; bd = c.info; }
	else if (variant === 'success') { bg = c.success; fg = '#fff'; bd = c.success; }
	else if (variant === 'danger') { bg = c.danger; fg = '#fff'; bd = c.danger; }
	else if (variant === 'warning') { bg = c.warning; fg = '#000'; bd = c.warning; }
	else if (variant === 'outline') { bg = 'transparent'; fg = c.text; bd = c.border; }
	return (
		<View style={[{ backgroundColor: bg, borderColor: bd, borderWidth: variant==='outline'?1:0, paddingHorizontal:8, paddingVertical:4, borderRadius:999, alignSelf:'flex-start' }, style]}>
			<Text style={[{ color: fg, fontSize:11, fontWeight:'600', letterSpacing:0.5 }, textStyle]}>{label}</Text>
		</View>
	);
}
// Stat (lighter than Card) for KPIs
export function Stat({ label, value, icon, variant='default', style, valueStyle, labelStyle }) {
	const c = useColors();
	const baseBg = variant==='accent'? c.primaryAlt : c.card;
	return (
		<View style={[{ backgroundColor: baseBg, padding:12, borderRadius:14, borderWidth:1, borderColor:c.border, alignItems:'flex-start', justifyContent:'center', minHeight:92 }, style]}>
			{icon ? <View style={{ marginBottom:6 }}>{icon}</View> : null}
			<Text style={[{ color:c.text, fontSize:20, fontWeight:'800', marginBottom:4 }, valueStyle]}>{value}</Text>
			<Text style={[{ color:c.muted, fontSize:12, fontWeight:'600', letterSpacing:0.5, textTransform:'uppercase' }, labelStyle]}>{label}</Text>
		</View>
	);
}
// ListItem for consistent list rows
export function ListItem({ title, subtitle, right, onPress, disabled=false, style, titleStyle, subtitleStyle }) {
	const c = useColors();
	return (
		<TouchableOpacity disabled={disabled || !onPress} onPress={onPress} activeOpacity={0.6} style={[{ opacity:disabled?0.5:1 }, style]}>
			<View style={{ paddingVertical:12, flexDirection:'row', alignItems:'center' }}>
				<View style={{ flex:1 }}>
					<Text style={[{ color:c.text, fontSize:15, fontWeight:'600' }, titleStyle]} numberOfLines={1}>{title}</Text>
					{subtitle ? <Text style={[{ color:c.muted, fontSize:12, marginTop:2 }, subtitleStyle]} numberOfLines={1}>{subtitle}</Text> : null}
				</View>
				{right ? <View style={{ marginLeft:12 }}>{right}</View> : null}
			</View>
			<View style={{ height:1, backgroundColor:c.border, opacity:0.4 }} />
		</TouchableOpacity>
	);
}
// Skeleton placeholder
export function Skeleton({ w='100%', h=16, radius=8, style }) {
	const c = useColors();
	return <View style={[{ width:w, height:h, borderRadius:radius, backgroundColor:c.card, overflow:'hidden' }, style]} />;
}
// Empty state
export function EmptyState({ title, subtitle, icon, action }) { const c=useColors(); return (
	<View style={{ padding:32, alignItems:'center', justifyContent:'center' }}>
		{icon ? <View style={{ marginBottom:12 }}>{icon}</View> : null}
		<Text style={{ color:c.text, fontSize:16, fontWeight:'700', marginBottom:4 }}>{title}</Text>
		{subtitle ? <Text style={{ color:c.muted, fontSize:13, textAlign:'center', lineHeight:18 }}>{subtitle}</Text> : null}
		{action ? <View style={{ marginTop:16 }}>{action}</View> : null}
	</View>
); }
// Spinner
export function Spinner({ size='small', color }) { const c = useColors(); return <ActivityIndicator size={size} color={color || c.primary} />; }

// Alert / Banner
export function AlertBanner({ type='info', title, message, style, onClose }) {
	const c = useColors();
	const map = { info:{ bg:c.info, fg:'#fff' }, success:{ bg:c.success, fg:'#fff' }, danger:{ bg:c.danger, fg:'#fff' }, warning:{ bg:c.warning, fg:'#000' } };
	const cfg = map[type] || map.info;
	return (
		<View style={[{ backgroundColor: cfg.bg, padding:12, borderRadius:12, marginBottom:12 }, style]}>
			<Text style={{ color:cfg.fg, fontWeight:'700', fontSize:15 }}>{title}</Text>
			{message ? <Text style={{ color:cfg.fg, marginTop:4, fontSize:13 }}>{message}</Text> : null}
			{onClose ? <TouchableOpacity accessibilityRole='button' onPress={onClose} style={{ position:'absolute', top:6, right:10 }}><Text style={{ color:cfg.fg, fontSize:18 }}>×</Text></TouchableOpacity> : null}
		</View>
	);
}

// Chip component (filter/select small)
export function Chip({ label, selected=false, onPress, style, textStyle }) {
	const c = useColors();
	return (
		<TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[{ paddingHorizontal:14, paddingVertical:8, borderRadius:999, backgroundColor: selected? c.primary : 'transparent', borderWidth:1, borderColor:selected? c.primary : c.border, marginRight:8, marginBottom:8 }, style]}>
			<Text style={[{ color: selected? '#0b0f13' : c.text, fontWeight:'600', fontSize:13 }, textStyle]}>{label}</Text>
		</TouchableOpacity>
	);
}
// Minimal cross-platform Select: renders una fila de botones pequeños (outline) y resalta el activo.
export function Select({ value, onChange, options = [], size='sm', style, buttonStyle }) {
	return (
		<Row gap={0.5} style={style}>
			{options.map(opt => (
				<Button
					key={opt.value}
					title={opt.label}
					size={size}
						variant={opt.value === value ? 'primary' : 'outline'}
					onPress={() => onChange?.(opt.value)}
					style={[{ marginBottom:0 }, buttonStyle]}
				/>
			))}
		</Row>
	);
}
// LocationStatus: compact reusable summary of GPS state
export function LocationStatus({ loc, t:translate }) {
	const t = translate || ((k)=>k);
	if (!loc) return null;
	if (loc.status === 'denied') return (
		<Row gap={0.5} wrap>
			<Badge label={t('gps_denied')} variant='danger' />
			<Button size='sm' title={t('open_settings')} variant='outline' onPress={()=>loc.openSettings?.()} />
		</Row>
	);
		if (loc.status === 'granted' && loc.position) {
			const inside = loc.isInsideGeofence;
			const showFence = loc.geofenceRadiusMeters && typeof loc.distanceMeters === 'number';
			const distStr = showFence ? `${t('distance')}: ${(loc.distanceMeters/ (loc.distanceMeters>1000?1000:1)).toFixed( loc.distanceMeters>1000?2:0)}${loc.distanceMeters>1000?'km':'m'}` : '';
			return (
				<Row gap={0.5} wrap>
					<Badge label={`${t('gps')} ${loc.position.coords.latitude.toFixed(3)}, ${loc.position.coords.longitude.toFixed(3)}${loc?.address?.city? ' · '+loc.address.city:''}`} variant={loc.isStale? 'outline':'info'} />
					{loc.lastUpdated && <P size='sm' muted>{t('gps_last_update')}: {new Date(loc.lastUpdated).toLocaleTimeString()}</P>}
					{loc.isStale && <Badge label={t('gps_stale')} variant='warning' />}
					{loc.isRetrying && <Badge label={t('gps_retrying')} variant='warning' />}
					{!!loc.errorCount && <Badge label={`${t('gps_errors')}: ${loc.errorCount}`} variant='danger' />}
					{showFence && <Badge label={inside? t('geofence_in') : t('geofence_out')} variant={inside? 'success':'danger'} />}
					{showFence && <Badge label={distStr} variant='outline' />}
				</Row>
			);
	}
	return <Button size='sm' variant='outline' title={t('gps')} onPress={()=>loc.getCurrent?.()} />;
}
const UI = { Screen, Card, H1, H2, P, Row, Button, Input, NumberInput, Divider, Spacer, UIHeader, Select, Badge, ListItem, Skeleton, Spinner, AlertBanner, Chip, Grid, Stat, EmptyState, SectionTitle, LocationStatus };
export { UIHeader };
export default UI;
