// 次に開ける窓を選ぶ。未訪問を優先し、今の窓は避ける
export function pickNext(ids, { visited = [], current = null, random = Math.random } = {}) {
  if (ids.length === 0) return null;
  if (ids.length === 1) return ids[0];
  const others = ids.filter((id) => id !== current);
  const fresh = others.filter((id) => !visited.includes(id));
  const pool = fresh.length ? fresh : others;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
