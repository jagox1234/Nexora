import "react-native-gesture-handler";
import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { useLoadResources } from "./src/hooks/useLoadResources.js";

// Prueba de sincronización StackBlitz

export default function AppRoot() {
  const ready = useLoadResources();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Cargando recursos...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nexora</Text>
      <Text style={styles.sub}>Expo SDK 53 · React 19 · RN {Platform.OS}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "600" },
  sub: { marginTop: 8, fontSize: 14, opacity: 0.7 },
});

// Install dependencies
// npm install
// npx expo install react react-dom react-native expo-asset expo-font react-native-web @expo/metro-runtime
// npm run web