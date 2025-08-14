// Nexora/0_error_boundary.js — catch and print runtime render errors
import React from "react";
import { View, Text, ScrollView } from "react-native";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (!this.state.error) return this.props.children;

    const msg = String(this.state.error?.message || this.state.error || "Unknown");
    const stack = String(
      (this.state.error && this.state.error.stack) ||
      (this.state.info && this.state.info.componentStack) ||
      ""
    );

    return (
      <ScrollView style={{ flex:1, backgroundColor:"#0b0f13", padding:16 }}>
        <Text style={{ color:"#fff", fontSize:18, fontWeight:"800", marginBottom:8 }}>Something went wrong</Text>
        <Text style={{ color:"#f87171", fontWeight:"700", marginBottom:12 }}>{msg}</Text>
        <Text style={{ color:"#93a3af", fontSize:12, lineHeight:18, whiteSpace:"pre-wrap" }}>
          {stack}
        </Text>
      </ScrollView>
    );
  }
}
