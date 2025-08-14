// Nexora/4_ui_header.js — app header with safe theme fallbacks
import { React, View, Text, TouchableOpacity } from "./2_dependencies";
import { useTheme } from "./4_ui_theme";

/**
 * Props:
 * - title: string
 * - subtitle?: string
 * - onBack?: () => void        // If provided, shows a back button
 * - right?: ReactNode          // Optional right-side actions (buttons, etc.)
 * - elevated?: boolean         // Adds subtle shadow/border
 * - style?: ViewStyle
 * - titleStyle?: TextStyle
 * - subtitleStyle?: TextStyle
 */
export default function UIHeader({
  title = "",
  subtitle = "",
  onBack,
  right = null,
  elevated = true,
  style,
  titleStyle,
  subtitleStyle,
}) {
  const t = useTheme?.();

  // Safe fallbacks
  const color = t?.color ?? {};
  const spacing = t?.spacing ?? {};
  const bg = color.card ?? "#0f1419";
  const text = color.text ?? "#e5eef5";
  const muted = color.muted ?? "#93a3af";
  const border = color.border ?? "#1f2933";
  const primary = color.primary ?? "#7dd3fc";

  const padV = spacing.md ?? 16;
  const padH = spacing.md ?? 16;
  const gap = spacing.sm ?? 10;

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          paddingVertical: padV,
          paddingHorizontal: padH,
          borderBottomWidth: 1,
          borderBottomColor: border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          // subtle elevation if desired
          shadowColor: elevated ? "#000" : "transparent",
          shadowOpacity: elevated ? 0.15 : 0,
          shadowRadius: elevated ? 8 : 0,
          shadowOffset: elevated ? { width: 0, height: 2 } : { width: 0, height: 0 },
          elevation: elevated ? 2 : 0,
        },
        style,
      ]}
    >
      {/* Left (back + title) */}
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: gap }}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={{ marginRight: gap }} activeOpacity={0.8}>
            <View
              style={{
                borderWidth: 1,
                borderColor: border,
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: text, fontWeight: "700" }}>‹</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <View style={{ flexShrink: 1 }}>
          {!!title && (
            <Text
              numberOfLines={1}
              style={[
                { color: text, fontSize: 18, fontWeight: "800" },
                titleStyle,
              ]}
            >
              {title}
            </Text>
          )}
          {!!subtitle && (
            <Text
              numberOfLines={1}
              style={[
                { color: muted, marginTop: 2, fontSize: 13 },
                subtitleStyle,
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Right actions */}
      <View style={{ flexDirection: "row", alignItems: "center", gap }}>
        {right}
      </View>
    </View>
  );
}
