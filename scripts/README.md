# Scripts de Seed y Limpieza

Este directorio contiene utilidades auxiliares para **sembrar** y **limpiar** datos de prueba en tu proyecto Supabase **sin modificar el código de producción**.

> IMPORTANTE: Nunca expongas ni subas al repositorio tu `SERVICE_ROLE_KEY`. Sólo debe usarse localmente en scripts administrativos.

## Variables de Entorno Comunes

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `SUPABASE_URL` | Sí | URL del proyecto (https://<ref>.supabase.co) |
| `SERVICE_ROLE_KEY` | Sí | Clave Service Role (Settings > API) |
| `SEED_USER_COUNT` | No | Cantidad de usuarios a crear (default 10) |
| `SEED_PASSWORD` | No | Password para todos los usuarios seeds (default `SeedUser123!`) |
| `DRY_RUN` | No | Si `1` en `cleanup`, sólo muestra lo que haría |
| `SEED_USER_EMAIL_PREFIX` | No | Prefijo de email para cleanup (default `seed_user_`) |

## 1. Sembrar Datos (`seed-users.mjs`)
Crea usuarios `seed_user_01@example.com`, ..., y les genera:
- Categorías (ingresos y gastos)
- Ingresos (2 fijos / variables)
- Gastos (5 variables + 2 fijos)
- `income_receipts` (últimos 3 meses)
- `expense_payments` (últimos 2 meses)

Marcados con tags `seed` para fácil filtrado.

### Uso (PowerShell / Windows)
```powershell
$env:SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY>"
$env:SUPABASE_URL="https://ref.supabase.co"
$env:SEED_USER_COUNT="10"
node scripts/seed-users.mjs
```

### Re-ejecutar
Es idempotente: reinsertará sólo lo necesario usando *merge duplicates*. Si un usuario ya existe y la API no devuelve su ID, se saltará la parte de datos (normalmente no pasa en seeds limpios).

## 2. Limpiar Datos (`cleanup-seed.mjs`)
Elimina toda la data generada para los usuarios seed en este orden:
1. `expense_payments`
2. `income_receipts`
3. `expenses`
4. `incomes`
5. `financial_goals` (si existieran)
6. `budgets` / `financial_insights` (si se usaran)
7. `financial_categories` (no system)
8. Usuarios en `auth` (Admin API)

Filtro de usuarios: emails que comienzan con el prefijo (default `seed_user_`).

### Uso
```powershell
$env:SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY>"
$env:SUPABASE_URL="https://ref.supabase.co"
node scripts/cleanup-seed.mjs
```

### Dry Run (simulación)
```powershell
$env:DRY_RUN="1"; node scripts/cleanup-seed.mjs
```
Muestra qué eliminaría sin tocar nada.

### Ajustar prefijo
```powershell
$env:SEED_USER_EMAIL_PREFIX="demo_"; node scripts/cleanup-seed.mjs
```

## Seguridad
- Usa siempre la Service Role Key sólo localmente.
- NO colocar la Service Role Key en `.env` del frontend (expondrías privilegios totales).

## Errores Comunes
| Problema | Causa | Solución |
|----------|-------|----------|
| `ERROR: Debes definir SERVICE_ROLE_KEY...` | Faltan env vars | Exportarlas antes de ejecutar |
| Usuarios quedan pero sin data | API devolvió "already registered" sin ID | Eliminar manualmente el usuario y re-seed |
| 404 en alguna tabla | Migración no aplicada | Asegurar que tu base está al día (migrations) |

## Próximos pasos (opcional)
- Añadir script de "snapshot" de datos.
- Añadir generación de más meses históricos.
- Añadir bandera para crear sólo ingresos o sólo gastos.

---
Cualquier mejora que quieras incorporar, abrí un PR en la rama `hotfix`.
