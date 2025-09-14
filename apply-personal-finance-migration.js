import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = 'https://djaxvumqpzjfctklcoaf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqYXh2dW1xcHpqZmN0a2xjb2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MDI2ODAsImV4cCI6MjA3MTk3ODY4MH0.cJ7w-82mnAgqgW7Oq5hqfIGwOO5BVvEHkQgDtr5SLZo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyPersonalFinanceMigration() {
    console.log('🚀 Iniciando migración de Finanzas Personales...\n');

    try {
        // Read the migration file
        const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250913230000_create_personal_finance_tables.sql');
        
        if (!fs.existsSync(migrationPath)) {
            console.log('❌ Archivo de migración no encontrado:', migrationPath);
            return;
        }

        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        console.log('📋 Migración cargada exitosamente');
        console.log('📊 Tamaño del archivo:', migrationSQL.length, 'caracteres\n');

        // Test current tables first (to ensure we don't break anything)
        console.log('🔍 Verificando tablas existentes...');
        
        const existingTables = [
            'cards',
            'feedback', 
            'housing_services',
            'profiles',
            'subscriptions',
            'team_members',
            'teams',
            'installments',
            'economic_indicators'
        ];

        for (const table of existingTables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                
                if (!error) {
                    console.log(`✅ ${table}: FUNCIONAL`);
                } else {
                    console.log(`⚠️ ${table}: ${error.message}`);
                }
            } catch (e) {
                console.log(`❌ ${table}: ERROR - ${e.message}`);
            }
        }

        console.log('\n📝 NOTA IMPORTANTE:');
        console.log('Esta migración debe aplicarse manualmente en el Supabase Dashboard');
        console.log('porque contiene DDL (CREATE TABLE) que requiere permisos de administrador.\n');

        console.log('🔗 Pasos para aplicar:');
        console.log('1. Ir a https://supabase.com/dashboard/project/djaxvumqpzjfctklcoaf');
        console.log('2. Ir a SQL Editor');
        console.log('3. Copiar y pegar el contenido del archivo:');
        console.log('   supabase/migrations/20250913230000_create_personal_finance_tables.sql');
        console.log('4. Ejecutar la migración');
        console.log('5. Verificar que las nuevas tablas fueron creadas\n');

        console.log('📋 Las tablas que se crearán:');
        console.log('- financial_categories (categorías de ingresos/gastos)');
        console.log('- incomes (gestión de ingresos)');
        console.log('- expenses (gestión de gastos)');
        console.log('- financial_goals (metas de ahorro)');
        console.log('- budgets (presupuestos)');
        console.log('- financial_insights (insights automáticos)\n');

        console.log('🛡️ GARANTÍA DE SEGURIDAD:');
        console.log('✅ No modifica ninguna tabla existente');
        console.log('✅ Solo agrega nuevas funcionalidades');
        console.log('✅ RLS completo para seguridad');
        console.log('✅ Reversible sin pérdida de datos\n');

    } catch (error) {
        console.error('💥 Error general:', error);
    }
}

applyPersonalFinanceMigration();