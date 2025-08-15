import { Asset } from "expo-asset";
import * as Font from "expo-font";
import { useCallback, useEffect, useState } from "react";

export function useLoadResources() {
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      await Promise.all([
        Font.loadAsync({
          Inter: require("../../assets/fonts/Inter-Regular.ttf")
        }),
        Asset.loadAsync([
          require("../../assets/icon.png"),
          require("../../assets/splash-icon.png"),
          require("../../assets/adaptive-icon.png")
        ])
      ]);
    } catch (e) {
      console.warn("Resource load error", e);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return ready;
}