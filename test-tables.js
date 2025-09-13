import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://djaxvumqpzjfctklcoaf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqYXh2dW1xcHpqZmN0a2xjb2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MDI2ODAsImV4cCI6MjA3MTk3ODY4MH0.cJ7w-82mnAgqgW7Oq5hqfIGwOO5BVvEHkQgDtr5SLZo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTables() {
    console.log('🔍 Verificando tablas de cuotas...\n');

    // Test installments table
    try {
        const { data, error } = await supabase
            .from('installments')
            .select('*')
            .limit(5);
        
        if (!error) {
            console.log('✅ Tabla INSTALLMENTS: FUNCIONAL');
            console.log(`📊 Registros encontrados: ${data.length}`);
            if (data.length > 0) {
                console.log('📝 Ejemplo de registro:', data[0]);
            }
        } else {
            console.log('❌ Tabla INSTALLMENTS: ERROR -', error.message);
        }
    } catch (e) {
        console.log('❌ Tabla INSTALLMENTS: EXCEPCIÓN -', e.message);
    }

    console.log('');

    // Test economic_indicators table
    try {
        const { data, error } = await supabase
            .from('economic_indicators')
            .select('*')
            .limit(5);
        
        if (!error) {
            console.log('✅ Tabla ECONOMIC_INDICATORS: FUNCIONAL');
            console.log(`📊 Registros encontrados: ${data.length}`);
            if (data.length > 0) {
                console.log('📝 Ejemplo de registro:', data[0]);
            }
        } else {
            console.log('❌ Tabla ECONOMIC_INDICATORS: ERROR -', error.message);
        }
    } catch (e) {
        console.log('❌ Tabla ECONOMIC_INDICATORS: EXCEPCIÓN -', e.message);
    }

    console.log('');

    // Test installments_analysis table
    try {
        const { data, error } = await supabase
            .from('installments_analysis')
            .select('*')
            .limit(5);
        
        if (!error) {
            console.log('✅ Tabla INSTALLMENTS_ANALYSIS: FUNCIONAL');
            console.log(`📊 Registros encontrados: ${data.length}`);
        } else {
            console.log('❌ Tabla INSTALLMENTS_ANALYSIS: ERROR -', error.message);
        }
    } catch (e) {
        console.log('❌ Tabla INSTALLMENTS_ANALYSIS: EXCEPCIÓN -', e.message);
    }

    console.log('\n🎉 ¡Verificación completa!');
}

testTables();