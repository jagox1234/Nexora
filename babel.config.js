module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            // Point core/ui/screens/nav/providers to v2 implementation
            "@core": "./Nexora v2/core",
            "@ui": "./Nexora v2/ui",
            "@screens": "./Nexora v2/screens",
            "@nav": "./Nexora v2/app/navigation",
            "@providers": "./Nexora v2/providers",
            "@app": "./Nexora v2", // now points to v2 root; legacy folder can be removed
            "@v2": "./Nexora v2"
          }
        }
      ],
      // Reanimated must be listed last
      "react-native-reanimated/plugin"
    ]
  };
};
