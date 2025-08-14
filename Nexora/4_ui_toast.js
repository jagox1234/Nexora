// Nexora/4_ui_toast.js — simple toast system (success/info/error) with safe theme usage
import { React, useState, useEffect, createContext, useContext, View, Text, Animated } from "./2_dependencies.js";
import { useTheme } from "./4_ui_theme.js";

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

let idSeq = 0;

export function ToastProvider({ children }) {
  const t = useTheme();
  const bgCard   = t?.color?.card   || "#0f1419";
  const textCol  = t?.color?.text   || "#e5eef5";
  const border   = t?.color?.border || "#1f2933";
  const primary  = t?.color?.primary || "#7dd3fc";
  const success  = t?.color?.success || "#22c55e";
  const info     = t?.color?.info    || "#38bdf8";
  const danger   = t?.color?.danger  || "#ef4444";

  const [items, setItems] = useState([]); // { id, text, color, anim }

  const push = (text, color) => {
    const id = ++idSeq;
    const anim = new Animated.Value(0);
    const item = { id, text, color, anim };
    setItems((arr) => [item, ...arr]);

    Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();

    setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setItems((arr) => arr.filter((x) => x.id !== id));
      });
    }, 2200);
  };

  const api = {
    success: (msg) => push(msg, success),
    info:    (msg) => push(msg, info),
    error:   (msg) => push(msg, danger),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}

      {/* Toast container (top) */}
      <View pointerEvents="none" style={{ position: "absolute", top: 16, left: 16, right: 16 }}>
        {items.map((it) => (
          <Animated.View
            key={it.id}
            style={{
              opacity: it.anim,
              transform: [{ translateY: it.anim.interpolate({ inputRange: [0,1], outputRange: [-10, 0] }) }],
              marginBottom: 8,
            }}
          >
            <View style={{
              backgroundColor: bgCard,
              borderColor: border,
              borderWidth: 1,
              borderLeftWidth: 4,
              borderLeftColor: it.color || primary,
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 12,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}>
              <Text style={{ color: textCol }}>{it.text}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </ToastCtx.Provider>
  );
}
