#!/usr/bin/env node
/**
 * Seed script para crear usuarios de prueba y datos financieros básicos en Supabase.
 * NO modifica código de la app; usa la API Admin (service role) y PostgREST.
 *
 * Requisitos (NO commitear claves):
 *   - SERVICE_ROLE_KEY  (exportar en la terminal, nunca en el .env del frontend)
 *   - SUPABASE_URL
 * Opcionales:
 *   - SEED_USER_COUNT (default 10)
 *   - SEED_PASSWORD (default "SeedUser123!")
 *
 * Uso:
 *   PowerShell:
 *     $env:SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY>"; $env:SUPABASE_URL="<URL>"; node scripts/seed-users.mjs
 *
 * Idempotente: si el usuario ya existe (email) lo reutiliza y evita reinserts duplicados.
 */

// Usa fetch global (Node 18+). Si usas Node <18 instala node-fetch y descomenta:
// import fetch from 'node-fetch';

// =============== Config ==================
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const COUNT = parseInt(process.env.SEED_USER_COUNT || '10', 10);
const PASSWORD = process.env.SEED_PASSWORD || 'SeedUser123!';

if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
  console.error('ERROR: Debes definir SERVICE_ROLE_KEY y SUPABASE_URL en variables de entorno.');
  process.exit(1);
}

const ADMIN_USERS_ENDPOINT = `${SUPABASE_URL}/auth/v1/admin/users`;
const REST_ENDPOINT = `${SUPABASE_URL}/rest/v1`;

// Helpers
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function createOrGetUser(email) {
  // Intentar listar por email (no hay endpoint directo; usamos filtro de admin users si disponible)
  // La API Admin no ofrece GET con filtro por email en la versión estándar. Estrategia:
  // Intentar crear directamente y si responde que ya existe, obtener el id por error detail (simplificado)
  const body = {
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: email.split('@')[0].replace(/[-_.]/g, ' ') }
  };
  const res = await fetch(ADMIN_USERS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    const json = await res.json();
    return { created: true, id: json.id, email: json.email };
  } else {
    const txt = await res.text();
    if (/already registered/i.test(txt)) {
      // fallback: no tenemos el id; no hay endpoint de búsqueda simple aquí.
      console.warn(`Usuario ya existía: ${email}. Debes obtener su id manualmente si lo necesitas.`);
      return { created: false, id: null, email };
    }
    console.error('Fallo creando usuario', email, txt);
    throw new Error('Cannot create user');
  }
}

async function upsert(table, rows, conflictCols = []) {
  if (!rows.length) return;
  const url = new URL(`${REST_ENDPOINT}/${table}`);
  if (conflictCols.length) {
    url.searchParams.set('on_conflict', conflictCols.join(','));
  }
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(rows)
  });
  if (!res.ok) {
    const t = await res.text();
    console.error(`Error upserting ${table}:`, t);
  }
}

function randomPick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function randAmount(min, max) { return +(Math.random() * (max - min) + min).toFixed(2); }

// Categorías básicas (system=false para usuario)
const incomeCategorySeeds = [ 'Salario', 'Freelance', 'Intereses' ];
const expenseCategorySeeds = [ 'Alquiler', 'Comida', 'Transporte', 'Servicios', 'Ocio' ];

async function seedForUser(user) {
  console.log(`\n-- Seeding datos para: ${user.email}`);
  if (!user.id) {
    console.log('  (Saltando datos porque no se obtuvo id del usuario via Admin API)');
    return;
  }

  // 1. Categorías
  const catRows = [
    ...incomeCategorySeeds.map(name => ({ name, type: 'income', user_id: user.id })),
    ...expenseCategorySeeds.map(name => ({ name, type: 'expense', user_id: user.id }))
  ].map(r => ({
    ...r,
    icon: '💰',
    color: '#3b82f6',
    is_system: false
  }));
  await upsert('financial_categories', catRows, ['user_id','name','type']);

  // Fetch categorías insertadas para vincular
  const catRes = await fetch(`${REST_ENDPOINT}/financial_categories?user_id=eq.${user.id}`, {
    headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
  });
  const cats = catRes.ok ? await catRes.json() : [];
  const incomeCats = cats.filter(c => c.type==='income');
  const expenseCats = cats.filter(c => c.type==='expense');

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // 2. Ingresos (2 por usuario)
  const incomes = [
    {
      user_id: user.id,
      category_id: incomeCats[0]?.id || null,
      name: 'Salario Principal',
      amount: randAmount(800, 1500),
      frequency: 'monthly',
      start_date: startOfYear.toISOString().slice(0,10),
      payment_day: 5,
      is_active: true,
      tags: ['seed']
    },
    {
      user_id: user.id,
      category_id: incomeCats[1]?.id || null,
      name: 'Ingreso Freelance',
      amount: randAmount(150, 400),
      frequency: 'monthly',
      start_date: startOfYear.toISOString().slice(0,10),
      payment_day: 20,
      is_active: true,
      tags: ['seed','variable']
    }
  ];
  await upsert('incomes', incomes);

  // Obtener incomes para receipts
  const incRes = await fetch(`${REST_ENDPOINT}/incomes?user_id=eq.${user.id}`, {
    headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
  });
  const incRows = incRes.ok ? await incRes.json() : [];

  // 3. Gastos (5 variables + 2 fijos)
  const expenses = [];
  for (let i=0;i<5;i++) {
    expenses.push({
      user_id: user.id,
      category_id: expenseCats[i % expenseCats.length]?.id || null,
      name: `Gasto Variable ${i+1}`,
      amount: randAmount(10, 90),
      expense_type: 'variable',
      frequency: 'once',
      transaction_date: today.toISOString().slice(0,10),
      is_recurring: false,
      tags: ['seed','var']
    });
  }
  for (let i=0;i<2;i++) {
    expenses.push({
      user_id: user.id,
      category_id: expenseCats[i % expenseCats.length]?.id || null,
      name: `Gasto Fijo ${i+1}`,
      amount: randAmount(50, 200),
      expense_type: 'fixed',
      frequency: 'monthly',
      transaction_date: today.toISOString().slice(0,10),
      due_date: today.toISOString().slice(0,10),
      is_recurring: true,
      recurring_day: (i===0?10:25),
      tags: ['seed','fixed']
    });
  }
  await upsert('expenses', expenses);

  // Obtener expenses para payments
  const expRes = await fetch(`${REST_ENDPOINT}/expenses?user_id=eq.${user.id}`, {
    headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
  });
  const expRows = expRes.ok ? await expRes.json() : [];

  // 4. Income receipts (últimos 3 meses para cada ingreso)
  const receipts = [];
  incRows.forEach(inc => {
    for (let m=0;m<3;m++) {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      const paidAt = new Date(d.getFullYear(), d.getMonth(), inc.payment_day || 5);
      const periodMonth = `${paidAt.getFullYear()}-${String(paidAt.getMonth()+1).padStart(2,'0')}`;
      receipts.push({
        user_id: user.id,
        income_id: inc.id,
        received_at: paidAt.toISOString(),
        amount: inc.amount,
        currency: 'USD',
        period_month: periodMonth,
        tags: ['seed']
      });
    }
  });
  await upsert('income_receipts', receipts);

  // 5. Expense payments (últimos 2 meses para gastos fijos)
  const payments = [];
  expRows.filter(e => e.expense_type === 'fixed').forEach(exp => {
    for (let m=0;m<2;m++) {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      const paidAt = new Date(d.getFullYear(), d.getMonth(), (exp.recurring_day || 10));
      const periodMonth = `${paidAt.getFullYear()}-${String(paidAt.getMonth()+1).padStart(2,'0')}`;
      payments.push({
        user_id: user.id,
        expense_id: exp.id,
        paid_at: paidAt.toISOString(),
        amount: exp.amount,
        currency: 'USD',
        period_month: periodMonth,
        tags: ['seed']
      });
    }
  });
  await upsert('expense_payments', payments);

  // 6. Budgets (presupuestos simples para el mes actual en 2 categorías)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0,10);
  const monthEnd = new Date(today.getFullYear(), today.getMonth()+1, 0).toISOString().slice(0,10);
  const budgetCats = expenseCats.slice(0,2);
  const budgets = budgetCats.map(cat => ({
    user_id: user.id,
    category_id: cat.id,
    name: `Presupuesto ${cat.name}`,
    budgeted_amount: randAmount(150, 400),
    spent_amount: 0,
    period_type: 'monthly',
    period_start: monthStart,
    period_end: monthEnd,
    status: 'active',
    alert_threshold: 80,
    notes: null,
    tags: ['seed']
  }));
  await upsert('budgets', budgets);

  // 7. Savings goals
  const goals = [
    { user_id: user.id, name: 'Fondo de Emergencia', target_amount: 1000, current_amount: randAmount(200,600), currency: 'USD', status: 'active', notes: null },
    { user_id: user.id, name: 'Vacaciones', target_amount: 1500, current_amount: randAmount(100,400), currency: 'USD', status: 'active', notes: null }
  ];
  await upsert('savings_goals', goals);

  console.log(`  ✔ Categorías: ${catRows.length} | Ingresos: ${incomes.length} | Gastos: ${expenses.length} | Receipts: ${receipts.length} | Payments: ${payments.length}`);
}

async function main() {
  console.log(`Iniciando seed para ${COUNT} usuarios...`);
  const users = [];
  for (let i=1; i<=COUNT; i++) {
    const email = `seed_user_${String(i).padStart(2,'0')}@example.com`;
    try {
      const u = await createOrGetUser(email);
      users.push(u);
      await sleep(300); // pequeña pausa para evitar rate limits
    } catch (e) {
      console.error('Abortando creación de usuario', email, e.message);
    }
  }

  for (const u of users) {
    try {
      await seedForUser(u);
    } catch (e) {
      console.error('Error sembrando datos para', u.email, e.message);
    }
  }

  console.log('\nSeed completado.');
}

main().catch(e => { console.error(e); process.exit(1); });
