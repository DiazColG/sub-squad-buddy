-- ===================================
-- TABLA USER_SETTINGS PARA BETA TESTING
-- ===================================
-- Ejecutar este script en Supabase Dashboard > SQL Editor

-- Crear tabla de configuraciones de usuario
CREATE TABLE IF NOT EXISTS user_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    beta_features_enabled boolean DEFAULT false,
    personal_finance_enabled boolean DEFAULT false,
    notifications_enabled boolean DEFAULT true,
    theme text DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies para user_settings
CREATE POLICY "Users can view their own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON user_settings FOR DELETE USING (auth.uid() = user_id);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Verificar la tabla fue creada
SELECT 'user_settings' as table_name, count(*) as row_count FROM user_settings;