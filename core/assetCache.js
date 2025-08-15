// Cache de assets y prefetch de datos críticos
export const assetCache = [];

export function cacheAsset(asset) {
  assetCache.push(asset);
  return asset;
}

export function getCachedAssets() {
  return assetCache;
}
