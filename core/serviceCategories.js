// Categorías y jerarquías de servicios
export const serviceCategories = [];

export function addCategory({ name, parentId = null }) {
  const category = { id: Date.now().toString(), name, parentId };
  serviceCategories.push(category);
  return category;
}

export function listCategories() {
  return serviceCategories;
}
