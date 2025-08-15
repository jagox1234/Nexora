// Wishlist / favoritos
export const favorites = [];

export function addFavorite({ userId, entityId, entityType }) {
  const fav = { id: Date.now().toString(), userId, entityId, entityType };
  favorites.push(fav);
  return fav;
}

export function listFavorites(userId) {
  return favorites.filter(f => f.userId === userId);
}
