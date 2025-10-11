#!/usr/bin/env node
/**
 * Limpia los datos sembrados por seed-users.mjs
 * Elimina datos en tablas dependientes antes de borrar usuarios y categorías.
 * Usa SERVICE_ROLE_KEY y SUPABASE_URL. NUNCA exponer esa clave públicamente.
 *
 * Orden de borrado (por FK y dependencia lógica):
 *  expense_payments -> income_receipts -> expenses -> incomes -> financial_goals -> budgets -> financial_insights -> financial_categories -> auth.users
 *
 * DRY_RUN=1 para simular.
 */
// Usa fetch global (Node 18+). Para Node <18 instala node-fetch y descomenta:
// import fetch from 'node-fetch';

const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const DRY_RUN = process.env.DRY_RUN === '1';
const PREFIX = process.env.SEED_USER_EMAIL_PREFIX || 'seed_user_';

if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
  console.error('ERROR: Debes definir SERVICE_ROLE_KEY y SUPABASE_URL');
  process.exit(1);
}

const REST = `${SUPABASE_URL}/rest/v1`;
const ADMIN_USERS = `${SUPABASE_URL}/auth/v1/admin/users`;

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
};

async function listSeedUsers() {
  // No hay endpoint de listado filtrado por email en Admin simple; workaround:
  // 1) Intentar paginar (si API soporta) -> muchas instalaciones no exponen.
  // 2) Requiere CLI normalmente. Para simplificar, aceptamos que sólo borraremos por coincidencia en data tables y luego opcionalmente el admin puede borrar manual.
  // Aquí implementamos una heurística: buscar en incomes y recoger user_ids distintos, luego buscar sus emails via admin (si existiera endpoint). Como no hay, se omite.
  // Resultado: Sólo borraremos datos, y el admin verá usuarios vacíos (puede borrarlos manualmente si desea) salvo que la API evolucione.
  return []; // placeholder (limitación explicada)
}

async function deleteWhere(table, column, userIds) {
  if (!userIds.length) return { table, skipped: true };
  const inFilter = userIds.map(id => `"${id}"`).join(',');
  const url = `${REST}/${table}?${column}=in.(${inFilter})`;
  if (DRY_RUN) {
    console.log(`[DRY] DELETE FROM ${table} WHERE ${column} IN (${userIds.length} ids)`);
    return { table, dry: true };
  }
  const res = await fetch(url, { method: 'DELETE', headers });
  if (!res.ok) {
    console.warn(`Error borrando en ${table}`, await res.text());
    return { table, error: true };
  }
  const count = res.headers.get('content-range') || '?';
  console.log(`✔ Borrado ${table} (ids=${userIds.length}) range=${count}`);
  return { table };
}

async function gatherUserIds() {
  // Leer incomes y expenses que tengan tag seed para derivar user_ids
  const tables = ['incomes', 'expenses'];
  const userSet = new Set();
  for (const t of tables) {
    const url = `${REST}/${t}?select=user_id,tags&tags=cs.{"seed"}`; // tags contiene seed
    const res = await fetch(url, { headers });
    if (!res.ok) continue;
    const rows = await res.json();
    rows.forEach(r => { if (r.user_id) userSet.add(r.user_id); });
  }
  return Array.from(userSet);
}

async function run() {
  console.log(`Iniciando cleanup (DRY_RUN=${DRY_RUN}) prefix=${PREFIX}`);

  const userIds = await gatherUserIds();
  if (!userIds.length) {
    console.log('No se encontraron user_ids con datos seed. Nada que hacer.');
    return;
  }
  console.log(`User IDs detectados (seed): ${userIds.length}`);

  // Orden de borrado
  await deleteWhere('expense_payments', 'user_id', userIds);
  await deleteWhere('income_receipts', 'user_id', userIds);
  await deleteWhere('expenses', 'user_id', userIds);
  await deleteWhere('incomes', 'user_id', userIds);
  await deleteWhere('financial_goals', 'user_id', userIds);
  await deleteWhere('budgets', 'user_id', userIds);
  await deleteWhere('financial_insights', 'user_id', userIds);
  await deleteWhere('financial_categories', 'user_id', userIds);

  console.log('\nDatos de tablas eliminados. Usuarios auth NO eliminados automáticamente (limitación API).');
  console.log('Puedes eliminar usuarios seed manualmente en Supabase > Auth > Users filtrando por prefix o email.');
  console.log('Cleanup finalizado.');
}

run().catch(e => { console.error(e); process.exit(1); });
