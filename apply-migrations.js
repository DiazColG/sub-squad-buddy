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

async function applyMigrations() {
    try {
        console.log('🚀 Iniciando aplicación de migraciones...');

        // First, let's check if tables already exist
        console.log('🔍 Verificando estado actual de las tablas...');
        
        try {
            const { data: existingInstallments } = await supabase
                .from('installments')
                .select('id')
                .limit(1);
            
            console.log('✅ Tabla installments ya existe');
        } catch (error) {
            console.log('📝 Tabla installments no existe, necesita ser creada');
        }

        try {
            const { data: existingIndicators } = await supabase
                .from('economic_indicators')
                .select('id')
                .limit(1);
            
            console.log('✅ Tabla economic_indicators ya existe');
        } catch (error) {
            console.log('📝 Tabla economic_indicators no existe, necesita ser creada');
        }

        // Since we can't execute DDL directly, let's check what we can do
        console.log('� Mostrando todas las tablas disponibles...');
        
        // Try to get schema information
        const { data: schemaData, error: schemaError } = await supabase
            .rpc('get_schema')
            .then(() => console.log('Schema RPC available'))
            .catch(() => console.log('Schema RPC not available'));

        // Let's see what tables are currently available
        const tables = [
            'cards',
            'feedback', 
            'housing_services',
            'profiles',
            'subscriptions',
            'team_members',
            'teams',
            'installments',
            'installments_analysis',
            'economic_indicators'
        ];

        console.log('🔍 Verificando acceso a cada tabla...');
        
        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                
                if (!error) {
                    console.log(`✅ ${table}: ACCESIBLE`);
                } else {
                    console.log(`❌ ${table}: ${error.message}`);
                }
            } catch (e) {
                console.log(`❌ ${table}: ERROR - ${e.message}`);
            }
        }

    } catch (error) {
        console.error('💥 Error general:', error);
    }
}

applyMigrations();