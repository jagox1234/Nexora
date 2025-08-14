// Nexora/4_ui_components.js — shared UI components (safe theme fallbacks)
import {
  React,
  View,
  Text,
  ScrollView,
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
} from "./2_dependencies";
import { useTheme } from "./4_ui_theme";

/* ========= helpers ========= */
const useColors = () => {
  const t = useTheme?.();
  return {
    bg: t?.color?.bg ?? t?.color?.background ?? "#0f1419",
    card: t?.color?.card ?? "#121820",
    text: t?.color?.text ?? "#e5eef5",
    muted: t?.color?.muted ?? "#93a3af",
    border: t?.color?.border ?? "#1f2933",
    primary: t?.color?.primary ?? "#7dd3fc",
    primaryAlt: t?.color?.primary_alt ?? "#38bdf8",
    danger: t?.color?.danger ?? "#ef4444",
    success: t?.color?.success ?? "#22c55e",
  };
};
const useSpacing = () => {
  const t = useTheme?.();
  return {
    xs: t?.spacing?.xs ?? 6,
    sm: t?.spacing?.sm ?? 10,
    md: t?.spacing?.md ?? 16,
    lg: t?.spacing?.lg ?? 20,
    xl: t?.spacing?.xl ?? 28,
  };
};

/* ========= primitives ========= */
export function Screen({ children, scroll = false, style, contentContainerStyle, ...props }) {
  const C = scroll ? ScrollView : View;
  const c = useColors();
  const s = useSpacing();
  return (
    <C
      style={[{ flex: 1, backgroundColor: c.bg, padding: s.md }, style]}
      contentContainerStyle={contentContainerStyle}
      {...props}
    >
      {children}
    </C>
  );
}

export function Card({ children, style }) {
  const c = useColors();
  const s = useSpacing();
  return (
    <View
      style={[
        {
          backgroundColor: c.card,
          borderColor: c.border,
          borderWidth: 1,
          borderRadius: 14,
          padding: s.md,
          marginBottom: s.sm,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function H1({ children, style }) {
  const c = useColors();
  const s = useSpacing();
  return (
    <Text style={[{ color: c.text, fontSize: 22, fontWeight: "800", marginBottom: s.md }, style]}>
      {children}
    </Text>
  );
}
export function H2({ children, style }) {
  const c = useColors();
  const s = useSpacing();
  return (
    <Text style={[{ color: c.text, fontSize: 16, fontWeight: "700", marginBottom: s.sm }, style]}>
      {children}
    </Text>
  );
}
export function P({ children, muted = false, style }) {
  const c = useColors();
  return (
    <Text style={[{ color: muted ? c.muted : c.text, fontSize: 14 }, style]}>
      {children}
    </Text>
  );
}

export function Row({ children, gap = 1, align = "stretch", justify = "flex-start", style }) {
  const s = useSpacing();
  const gapPx = typeof gap === "number" ? gap * 8 : 8;
  return (
    <View style={[{ flexDirection: "row", alignItems: align, justifyContent: justify }, style]}>
      {React.Children.map(children, (child, idx) => (
        <View style={{ marginRight: idx < React.Children.count(children) - 1 ? gapPx : 0 }}>{child}</View>
      ))}
    </View>
  );
}

export function Spacer({ h = 1 }) {
  const s = useSpacing();
  const base = 8;
  return <View style={{ height: h * base }} />;
}

export function Divider({ style }) {
  const c = useColors();
  return <View style={[{ height: 1, backgroundColor: c.border, opacity: 0.8, marginVertical: 8 }, style]} />;
}

/* ========= form controls ========= */
export function Input({ style, ...props }) {
  const c = useColors();
  const s = useSpacing();
  return (
    <RNTextInput
      placeholderTextColor={c.muted}
      style={[
        {
          backgroundColor: c.bg,
          color: c.text,
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 12,
          paddingHorizontal: s.md,
          paddingVertical: 10,
          marginBottom: s.sm,
        },
        style,
      ]}
      {...props}
    />
  );
}

export function Button({
  title,
  onPress,
  variant = "primary", // "primary" | "outline" | "danger" | "ghost"
  size = "md", // "sm" | "md"
  style,
  textStyle,
  disabled = false,
}) {
  const c = useColors();
  const s = useSpacing();

  const padV = size === "sm" ? 8 : 12;
  const padH = size === "sm" ? 10 : 12;

  let bg = c.primary;
  let bd = c.primary;
  let fg = "#0b0f13";

  if (variant === "outline") {
    bg = "transparent";
    bd = c.border;
    fg = c.text;
  } else if (variant === "danger") {
    bg = c.danger;
    bd = c.danger;
    fg = "#fff";
  } else if (variant === "ghost") {
    bg = "transparent";
    bd = "transparent";
    fg = c.text;
  }

  const opacity = disabled ? 0.5 : 1;

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}>
      <View
        style={[
          {
            opacity,
            backgroundColor: bg,
            borderColor: bd,
            borderWidth: variant === "outline" ? 1 : bg === "transparent" ? 0 : 1,
            paddingVertical: padV,
            paddingHorizontal: padH,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <Text style={[{ color: fg, fontWeight: "700" }, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ========= default export (opcional) ========= */
const UI = { Screen, Card, H1, H2, P, Row, Button, Input, Divider, Spacer };
export default UI;
