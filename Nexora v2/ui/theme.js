// v2/ui/theme.js — theme provider & hook (migrated)
import { React, createContext, useContext, useState, useMemo, useEffect, AsyncStorage } from '../app/dependencies.js';

// ThemeContext payload will expose: mode, toggleMode, color (semantic tokens), spacing, radius, shadows, typography
const ThemeContext = createContext();

// Spacing & shape scales
const baseSpacing = { xs:4, sm:8, md:16, lg:24, xl:32 };
const baseRadius = { xs:4, sm:6, md:10, lg:14, pill:999 };

// Shadow/elevation tokens (web + native mapping friendly)
const baseShadows = {
	none: { shadowColor:'transparent', shadowOpacity:0, shadowRadius:0, shadowOffset:{ width:0, height:0 }, elevation:0 },
	sm:   { shadowColor:'#000', shadowOpacity:0.08, shadowRadius:4, shadowOffset:{ width:0, height:1 }, elevation:1 },
	md:   { shadowColor:'#000', shadowOpacity:0.12, shadowRadius:8, shadowOffset:{ width:0, height:2 }, elevation:3 },
	lg:   { shadowColor:'#000', shadowOpacity:0.18, shadowRadius:16, shadowOffset:{ width:0, height:4 }, elevation:6 },
	overlay: { shadowColor:'#000', shadowOpacity:0.28, shadowRadius:24, shadowOffset:{ width:0, height:8 }, elevation:12 },
};

// Typography scale (can be extended later)
const baseTypography = {
	fontFamily: undefined, // system
	sizes: { xs:11, sm:13, md:14, lg:16, xl:20, xxl:24 },
	weights: { regular:'400', medium:'500', semibold:'600', bold:'700', extrabold:'800' },
};

// Semantic color tokens (light & dark). We keep legacy aliases for compatibility (background, card, text, muted, border, primary, primaryAlt)
const lightTokens = {
	mode:'light',
	bgSurface:'#f5f6f7',
	bgSurfaceAlt:'#ffffff',
	bgElevated:'#ffffff',
	textPrimary:'#111827',
	textInverted:'#ffffff',
	textMuted:'#6b7280',
	borderSubtle:'#d1d5db',
	borderStrong:'#b9c1c9',
	accent:'#2563eb',
	accentAlt:'#1d4ed8',
	accentSoft:'#eff6ff',
	success:'#16a34a',
	danger:'#dc2626',
	warning:'#d97706',
	info:'#0284c7',
	gradientStart:'#ffffff',
	gradientEnd:'#e5e7eb',
};
const darkTokens = {
	mode:'dark',
	bgSurface:'#0f1419',
	bgSurfaceAlt:'#1f2933',
	bgElevated:'#27333d',
	textPrimary:'#f3f4f6',
	textInverted:'#0f1419',
	textMuted:'#9ca3af',
	borderSubtle:'#374151',
	borderStrong:'#4b5561',
	accent:'#3b82f6',
	accentAlt:'#2563eb',
	accentSoft:'#1e3a8a',
	success:'#4ade80',
	danger:'#f87171',
	warning:'#fbbf24',
	info:'#38bdf8',
	gradientStart:'#0f1419',
	gradientEnd:'#1f2933',
};

// Build legacy-compatible color object from semantic tokens
function buildColorObject(tokens) {
	return {
		...tokens,
		// legacy keys consumed elsewhere
		background: tokens.bgSurface,
		card: tokens.bgSurfaceAlt,
		text: tokens.textPrimary,
		muted: tokens.textMuted,
		border: tokens.borderSubtle,
		primary: tokens.accent,
		primaryAlt: tokens.accentAlt,
		success: tokens.success,
		danger: tokens.danger,
		warning: tokens.warning,
		info: tokens.info,
		bg: tokens.bgSurface, // alias for navigation
	};
}

export function ThemeProvider({ children }) {
	const [mode, setMode] = useState('light');
	const [ready, setReady] = useState(false);
	useEffect(() => { (async () => { try { const saved = await AsyncStorage.getItem('nx_theme_mode'); if (saved==='light'||saved==='dark') setMode(saved); } catch {} setReady(true); })(); }, []);
	const toggleMode = () => { setMode(prev => { const next = prev==='light' ? 'dark' : 'light'; AsyncStorage.setItem('nx_theme_mode', next).catch(()=>{}); return next; }); };
	const value = useMemo(() => {
		const tokens = mode==='light' ? lightTokens : darkTokens;
		const color = buildColorObject(tokens);
		return { mode, toggleMode, color, spacing: baseSpacing, radius: baseRadius, shadows: baseShadows, typography: baseTypography };
	}, [mode]);
	if (!ready) return null;
	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
