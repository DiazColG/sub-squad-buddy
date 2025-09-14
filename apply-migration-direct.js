const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = 'https://djaxvumqpzjfctklcoaf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesita la service key

async function applyMigration() {
    console.log('🚀 Aplicando migración de Finanzas Personales...');
    
    if (!supabaseServiceKey) {
        console.log('❌ Error: SUPABASE_SERVICE_ROLE_KEY no encontrada');
        console.log('🔑 Necesitas configurar la service role key para aplicar migraciones DDL');
        console.log('📝 Aplica la migración manualmente en Supabase Dashboard:');
        console.log('   1. Ir a https://supabase.com/dashboard/project/djaxvumqpzjfctklcoaf');
        console.log('   2. Ir a SQL Editor');
        console.log('   3. Ejecutar el contenido de: supabase/migrations/20250913230000_create_personal_finance_tables.sql');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // Leer el archivo de migración
        const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250913230000_create_personal_finance_tables.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📋 Ejecutando migración...');
        
        // Ejecutar la migración
        const { data, error } = await supabase.rpc('exec_sql', { 
            sql: migrationSQL 
        });
        
        if (error) {
            console.error('❌ Error aplicando migración:', error);
            return;
        }
        
        console.log('✅ Migración aplicada exitosamente!');
        
        // Verificar que las tablas fueron creadas
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', [
                'financial_categories',
                'incomes', 
                'expenses',
                'financial_goals',
                'budgets',
                'financial_insights'
            ]);
            
        if (tablesError) {
            console.log('⚠️ No se pudo verificar las tablas:', tablesError);
        } else {
            console.log('🎉 Tablas creadas exitosamente:');
            tables.forEach(table => console.log(`   ✅ ${table.table_name}`));
        }
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

applyMigration();