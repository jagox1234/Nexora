class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Global app error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#1f2933' }}>
          <Text style={{ color:'red', fontSize:18, fontWeight:'bold', marginBottom:12 }}>Error global en la app</Text>
          <Text style={{ color:'#fff', fontSize:14, marginBottom:8 }}>{String(this.state.error)}</Text>
          <Text style={{ color:'#93a3af', fontSize:12 }}>Revisa la consola del navegador para más detalles.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
// Root entry — mounts the real Nexora app (providers + navigation).
import "react-native-gesture-handler";
import "react-native-reanimated"; // ensure initialized early

import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Text, Platform } from "react-native";

// Internal imports (ordered by path depth/name)
import { mark, measure } from "@v2/core/utils.js";
import { useApp } from "@v2/core/index.js";
import { ThemeProvider, ToastProvider, ModalProvider, AppProvider, LocationProvider } from "@v2/providers/index.js";
import { useTheme } from "@v2/ui/theme.js";
import ErrorBoundary from "@v2/app/ErrorBoundary.js";
import AppRoot from "@v2/app/navigation/AppNavigation.js"; // navigation
// Using v2 alias for all framework code

import { useLoadResources } from "./src/hooks/useLoadResources";

export default function App() {
  const ready = useLoadResources();
  useEffect(()=>{ mark('app_boot'); },[]);
  const [timeoutInfo, setTimeoutInfo] = useState(false);
  const first = useRef(Date.now());

  useEffect(() => {
    // If resources take >5s, show hint
    const id = setTimeout(() => {
      if (!ready) setTimeoutInfo(true);
    }, 5000);
    return () => clearTimeout(id);
  }, [ready]);

  useEffect(() => {
    if (ready){
      console.log("[App] Resources loaded in", Date.now() - first.current, "ms");
      measure('app_boot_duration','app_boot');
    }
  }, [ready]);

  return (
    <GlobalErrorBoundary>
      {!ready ? (
        <View style={{ flex:1, alignItems:"center", justifyContent:"center", backgroundColor:"#0f1419" }}>
          <ActivityIndicator size="large" color="#7dd3fc" />
          <Text style={{ marginTop:16, color:"#e5eef5", fontWeight:"600" }}>Cargando recursos…</Text>
          <Text style={{ marginTop:4, color:"#93a3af", fontSize:12 }}>Expo SDK 53 · React 19 · RN {Platform.OS}</Text>
          {timeoutInfo ? (
            <View style={{ marginTop:24, maxWidth:300 }}>
              <Text style={{ color:"#f87171", fontSize:12, textAlign:"center" }}>
                Tarda demasiado… Si ves blanco en dispositivo:
                1) Asegura misma red.
                2) Prueba `expo start --tunnel`.
                3) Agita el móvil para ver errores.
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <MaybeWebFrame>
          <ThemeProvider>
            <LocationProvider autoRequest={false}>
              <AppProvider>
                <ModalProvider>
                  <ToastProvider>
                    <ErrorBoundary>
                      <AppRoot />
                    </ErrorBoundary>
                  </ToastProvider>
                </ModalProvider>
              </AppProvider>
            </LocationProvider>
          </ThemeProvider>
          <MaybeDevPanel />
        </MaybeWebFrame>
      )}
    </GlobalErrorBoundary>
  );
}

// ---- Web only frame to simulate a device ----
function MaybeWebFrame({ children }) {
  if (Platform.OS !== 'web') return children;
  return (
    <View style={{ flex:1, backgroundColor:'#111827', alignItems:'center', justifyContent:'center', padding:24 }}>
      <View style={{ width:390, height:844, backgroundColor:'#000', borderRadius:40, overflow:'hidden', borderWidth:2, borderColor:'#1f2933', boxShadow:'0 10px 25px rgba(0,0,0,0.35)' }}>
        {children}
      </View>
    </View>
  );
}

// ---- Web only Dev Panel (role/theme/reset) ----
function MaybeDevPanel() {
  const isWeb = Platform.OS === 'web';
  const appCtx = useApp();
  const theme = useTheme();
  const [open, setOpen] = useState(true); // always declared
  if (!isWeb || !appCtx || !theme) return null; // only conditional return AFTER hooks
  const { role, pickRole, clearRole } = appCtx;
  const resetData = async () => {
    const keys = ['nx_role','nx_clinic','nx_services','nx_clients','nx_bookings','nx_client_requests','nx_sync_queue'];
    try {
      const { AsyncStorage } = await import('@v2/app/baseDependencies.js');
      for (const k of keys) { try { await AsyncStorage.removeItem(k); } catch {} }
      clearRole();
      if (typeof globalThis !== 'undefined' && globalThis.alert) globalThis.alert('Storage limpiado');
    } catch {}
  };
  return (
    <View style={{ position:'absolute', top:12, right:12, zIndex:9999, maxWidth: open?230:70 }}>
      <View style={{ backgroundColor:'#1f2933', padding:10, borderRadius:14, borderWidth:1, borderColor:'#374151' }}>
        <Text onPress={()=>setOpen(o=>!o)} style={{ color:'#93a3af', fontSize:12, marginBottom:8 }}>{open? 'DevPanel ▲':'Dev ▼'}</Text>
        {open && (
          <>
            <Label>Rol: {role||'—'}</Label>
            <RowBtns>
              <SmallBtn label="Client" active={role==='client'} onPress={()=>pickRole('client')} />
              <SmallBtn label="Business" active={role==='business'} onPress={()=>pickRole('business')} />
              <SmallBtn label="Reset" onPress={clearRole} />
            </RowBtns>
            <Label style={{ marginTop:8 }}>Tema: {theme.mode}</Label>
            <RowBtns>
              <SmallBtn label="Toggle" onPress={theme.toggleMode} />
            </RowBtns>
            <Label style={{ marginTop:8 }}>Storage</Label>
            <RowBtns>
              <SmallBtn label="Clear" onPress={resetData} />
            </RowBtns>
          </>
        )}
      </View>
    </View>
  );
}

function SmallBtn({ label, onPress, active }) {
  return (
    <Text onPress={onPress} style={{ backgroundColor: active? '#2563eb':'#374151', color:'#e5eef5', paddingVertical:4, paddingHorizontal:8, borderRadius:8, fontSize:11, marginRight:6, marginBottom:6 }}>{label}</Text>
  );
}
function RowBtns({ children }) { return <View style={{ flexDirection:'row', flexWrap:'wrap' }}>{children}</View>; }
function Label({ children, style }) { return <Text style={[{ color:'#93a3af', fontSize:11, fontWeight:'600', marginBottom:4 }, style]}>{children}</Text>; }
