// Feature flags / remote config
export const featureFlags = [];

export function setFeatureFlag({ key, value }) {
  const idx = featureFlags.findIndex(f => f.key === key);
  if (idx >= 0) featureFlags[idx].value = value;
  else featureFlags.push({ key, value });
}

export function getFeatureFlag(key) {
  const flag = featureFlags.find(f => f.key === key);
  return flag ? flag.value : null;
}
