// Local fallback storage for budgets when Supabase is unavailable or schema mismatches.

export interface LocalBudgetRow {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  budgeted_amount: number;
  spent_amount: number | null;
  period_type: string;
  period_start: string; // YYYY-MM-DD
  period_end: string;   // YYYY-MM-DD
  alert_threshold: number | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const key = (userId: string) => `budgets:${userId}`;

export function loadLocalBudgets(userId: string): LocalBudgetRow[] {
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalBudgetRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalBudgets(userId: string, rows: LocalBudgetRow[]) {
  localStorage.setItem(key(userId), JSON.stringify(rows));
}

export function addLocalBudget(userId: string, row: Omit<LocalBudgetRow, 'id'|'created_at'|'updated_at'> & { id?: string }) {
  const rows = loadLocalBudgets(userId);
  const now = new Date().toISOString();
  const id = row.id || (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  const full: LocalBudgetRow = { ...row, id, created_at: now, updated_at: now } as LocalBudgetRow;
  rows.unshift(full);
  saveLocalBudgets(userId, rows);
  return full;
}

export function updateLocalBudget(userId: string, id: string, updates: Partial<LocalBudgetRow>) {
  const rows = loadLocalBudgets(userId);
  const idx = rows.findIndex(r => r.id === id);
  if (idx >= 0) {
    rows[idx] = { ...rows[idx], ...updates, updated_at: new Date().toISOString() };
    saveLocalBudgets(userId, rows);
    return rows[idx];
  }
  return null;
}

export function removeLocalBudget(userId: string, id: string) {
  const rows = loadLocalBudgets(userId).filter(r => r.id !== id);
  saveLocalBudgets(userId, rows);
}
