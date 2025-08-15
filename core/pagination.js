// Carga de datos paginada / virtualizada
export function paginate(data, page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
}
