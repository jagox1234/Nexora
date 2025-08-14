// Nexora/2_dependencies.js — unified deps (Android/iOS/Web safe)

// 1) React
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useContext,
  createContext,
} from "react";

// 2) React Native
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Pressable,
  TextInput,
  StyleSheet,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  Animated,
  Easing,
} from "react-native";

// 3) AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";

// 4) Expo LinearGradient
import { LinearGradient } from "expo-linear-gradient";

// 5) SVG
import { Svg, Path, Rect, Circle, Line, Polyline, Polygon } from "react-native-svg";

export {
  // React
  React,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useContext,
  createContext,
  // RN
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Pressable,
  TextInput,
  StyleSheet,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  Animated,
  Easing,
  // Storage
  AsyncStorage,
  // Expo
  LinearGradient,
  // SVG
  Svg,
  Path,
  Rect,
  Circle,
  Line,
  Polyline,
  Polygon
};
