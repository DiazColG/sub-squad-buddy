// Script simplificado para aplicar migración
const { createClient } = require('@supabase/supabase-js');

// Usar las mismas credenciales que la app
const supabaseUrl = 'https://djaxvumqpzjfctklcoaf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqYXh2dW1xcHpqZmN0a2xjb2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ5MDMxNjcsImV4cCI6MjA0MDQ3OTE2N30.k82L5SX5aYTB2dJfK4lGP6gdjJFfx_Jm59ZCjx8mVJE';

async function createTablesManually() {
    console.log('🚀 Creando tablas de finanzas personales...');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Crear tabla financial_categories
    console.log('📋 Creando tabla financial_categories...');
    const { error: categoryError } = await supabase.rpc('create_financial_categories_table');
    
    if (categoryError) {
        console.log('⚠️ Tabla financial_categories ya existe o error:', categoryError.message);
    } else {
        console.log('✅ Tabla financial_categories creada');
    }
    
    // Verificar que podemos acceder a las tablas existentes
    console.log('🔍 Verificando acceso a tablas existentes...');
    const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .limit(1);
        
    if (subError) {
        console.log('❌ Error accediendo subscriptions:', subError.message);
    } else {
        console.log('✅ Acceso a subscriptions OK');
    }
    
    console.log('');
    console.log('📝 PRÓXIMO PASO:');
    console.log('La migración debe aplicarse manualmente en Supabase Dashboard');
    console.log('https://supabase.com/dashboard/project/djaxvumqpzjfctklcoaf');
}

createTablesManually();