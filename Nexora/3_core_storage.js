// Nexora/3_core_storage.js — local persistence helpers
import { AsyncStorage } from "./2_dependencies.js";

export const saveJSON = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // intentionally left blank (best-effort local save)
  }
};

export const loadJSON = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    // intentionally left blank
    return fallback;
  }
};
