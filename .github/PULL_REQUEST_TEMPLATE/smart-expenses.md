# v0.2.0 — Smart Expenses

## Resumen
Entrega enfocada en una experiencia de finanzas personales MUY amigable, unificación de gastos, estabilidad en ingresos multi-moneda, branding "Compounding" y módulo FIRE (educación + calculadora).

## Cambios principales
- Gastos: plantillas recurrentes (autopago/recordatorios), inbox mensual (confirmar/editar/snooze), "Confirmar todo", "Vencen pronto", "Marcar pagado", sugerencias de monto.
- Unificación: Suscripciones y Servicios de Vivienda reflejados en Gastos con tags de procedencia.
- Ingresos: moneda por ingreso, toggle para ver totales en moneda de perfil, fix Radix Select.
- FIRE: página + calculadora con escenarios; persistencia en Supabase (RLS) con fallback local.
- Branding/PWA: icono `icon-graph.svg`, manifest y meta actualizados; Sidebar y landing con "Compounding".
- Onboarding/Docs: Smart Start + actualización "Casos de Uso".

## Migraciones
- `20250921120000_add_fire_scenarios.sql` — crea `public.fire_scenarios` (RLS + trigger `updated_at`).

## Cómo probar
1. Ingresos: crear ingresos en distintas monedas; activar "Ver en {moneda perfil}" y validar totales.
2. Gastos: crear plantilla recurrente (autopago/recordatorios), confirmar desde inbox, usar "Confirmar todo", "Marcar pagado" y ver "Vencen pronto".
3. Suscripciones/Servicios: activar reflejo en Gastos y validar tags de procedencia y recordatorios.
4. FIRE: abrir `/fire`, completar datos, guardar escenarios; verificar persistencia.

## Checklist
- [ ] Migración `fire_scenarios` aplicada en Supabase.
- [ ] Smoke de Ingresos, Gastos y FIRE OK.
- [ ] Revisión visual de branding/manifest.

## Enlaces
- Release notes: `docs/releases/v0.2.0-smart-expenses.md`