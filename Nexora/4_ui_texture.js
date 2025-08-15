// Nexora/4_ui_texture.js — layered textured backgrounds with gradients
import React from 'react';

import { View } from "./2_dependencies.js";
import { LinearGradient } from "./2_dependencies.js";
import { useTheme } from "./4_ui_theme.js";

/**
 * TexturedSurface
 *  capa base metalizada + bandas diagonales sutiles + sheen opcional
 *  props:
 *    kind: "bg" | "card" | "btn"
 *    sheen: boolean (por defecto true salvo en bg)
 *    style: estilos del contenedor final
 *    children
 */
export function TexturedSurface({ kind = "card", sheen, style, children }) {
  const t = useTheme();
  const isLight = t.color.text === "#0f172a"; // aprox: modo claro
  const stripes = isLight ? t.texture.stripes_light : t.texture.stripes_dark;

  // set por tipo
  const baseGrad =
    kind === "bg"   ? t.color.metal_bg :
    kind === "btn"  ? t.color.metal_btn : t.color.metal_card;

  const angle =
    kind === "bg"  ? t.texture.angle_bg  :
    kind === "btn" ? t.texture.angle_btn : t.texture.angle_card;

  const showSheen = sheen ?? (kind !== "bg");

  return (
    <LinearGradient colors={baseGrad} start={{x:0,y:0}} end={{x:1,y:1}} style={style}>
      {/* bandas diagonal (textura) */}
      <LinearGradient
        colors={stripes}
        locations={t.texture.stripes_stops}
        start={{ x: angle.x, y: 0 }}
        end={{ x: 1 - angle.x, y: 1 }}
        style={{ ...StyleSheet.absoluteFillObject }}
      />
      {/* sheen superior opcional */}
      {showSheen ? (
        <LinearGradient
          colors={t.color.metal_sheen}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 8, opacity: t.texture.sheen_opacity }}
        />
      ) : null}
      {children}
      {/* sombra interior inferior (muy sutil) */}
      {kind !== "bg" ? <View style={{ height: 6, backgroundColor: "rgba(0,0,0,0.22)" }} /> : null}
    </LinearGradient>
  );
}

// RN StyleSheet shim local (evitar import adicional)
const StyleSheet = {
  absoluteFillObject: {
    position: "absolute",
    left: 0, right: 0, top: 0, bottom: 0,
  },
};
