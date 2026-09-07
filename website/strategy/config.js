// 表示名は name で管理。URL と保存キーは名前に依存させない。
export const CONFIG = Object.freeze({ name: 'HiNa Kai', provisional: false, storageKey: 'nocta:strategy:v1' });
export function brand() { return CONFIG.name + (CONFIG.provisional ? '（仮）' : ''); }
