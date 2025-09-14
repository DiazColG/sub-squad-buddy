// Script para aplicar migración de finanzas personales
// Este script ejecuta la migración usando la conexión existente de la app

import { supabase } from './src/integrations/supabase/client.js';
import fs from 'fs';
import path from 'path';

async function applyPersonalFinanceMigration() {
    console.log('🚀 Aplicando migración de Finanzas Personales...');
    
    try {
        // Verificar conexión
        const { data: user, error: authError } = await supabase.auth.getUser();
        if (authError) {
            console.log('❌ Error de autenticación:', authError.message);
            console.log('🔑 Aplica la migración manualmente en Supabase Dashboard');
            return;
        }
        
        // Leer archivo de migración
        const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250913230000_create_personal_finance_tables.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Dividir la migración en bloques ejecutables
        const sqlStatements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📋 Ejecutando ${sqlStatements.length} declaraciones SQL...`);
        
        // Ejecutar cada declaración
        for (let i = 0; i < sqlStatements.length; i++) {
            const statement = sqlStatements[i];
            if (statement.trim()) {
                console.log(`   ${i + 1}/${sqlStatements.length}: Ejecutando...`);
                
                const { error } = await supabase.rpc('exec_sql', { 
                    sql: statement + ';' 
                });
                
                if (error) {
                    console.error(`❌ Error en declaración ${i + 1}:`, error);
                    continue;
                }
            }
        }
        
        console.log('✅ Migración completada!');
        
        // Verificar tablas creadas
        console.log('🔍 Verificando tablas creadas...');
        const tablesToCheck = [
            'financial_categories',
            'incomes',
            'expenses', 
            'financial_goals',
            'budgets',
            'financial_insights'
        ];
        
        for (const tableName of tablesToCheck) {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .limit(1);
                
            if (error) {
                console.log(`   ❌ ${tableName}: ERROR - ${error.message}`);
            } else {
                console.log(`   ✅ ${tableName}: CREADA`);
            }
        }
        
    } catch (err) {
        console.error('❌ Error general:', err.message);
        console.log('');
        console.log('📝 INSTRUCCIONES MANUALES:');
        console.log('1. Ir a https://supabase.com/dashboard/project/djaxvumqpzjfctklcoaf');
        console.log('2. Ir a SQL Editor');
        console.log('3. Copiar y pegar el contenido completo de:');
        console.log('   supabase/migrations/20250913230000_create_personal_finance_tables.sql');
        console.log('4. Ejecutar la migración');
    }
}

applyPersonalFinanceMigration();