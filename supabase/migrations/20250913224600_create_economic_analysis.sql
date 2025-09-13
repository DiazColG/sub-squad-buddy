-- Create installments_analysis table for economic data
CREATE TABLE installments_analysis (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    installment_id uuid REFERENCES installments(id) ON DELETE CASCADE NOT NULL,
    period_month text NOT NULL, -- Format: YYYY-MM
    nominal_amount decimal(12,2) NOT NULL,
    real_amount decimal(12,2), -- Adjusted for inflation
    usd_amount decimal(12,2), -- Converted to USD
    inflation_rate decimal(8,4), -- Monthly inflation rate (percentage)
    usd_exchange_rate decimal(10,4), -- ARS to USD exchange rate
    purchasing_power_index decimal(10,4), -- Base 100 index
    analysis_date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Ensure unique analysis per installment per month
    UNIQUE(installment_id, period_month)
);

-- Create economic_indicators table for historical data
CREATE TABLE economic_indicators (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    period_month text NOT NULL UNIQUE, -- Format: YYYY-MM
    inflation_rate decimal(8,4), -- Monthly inflation rate
    accumulated_inflation decimal(10,4), -- Year-to-date inflation
    usd_official_rate decimal(10,4), -- Official USD exchange rate
    usd_blue_rate decimal(10,4), -- Blue/parallel USD rate
    purchasing_power_index decimal(10,4), -- Cumulative purchasing power
    data_source text DEFAULT 'manual', -- 'api', 'manual', 'estimated'
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_installments_analysis_installment_id ON installments_analysis(installment_id);
CREATE INDEX idx_installments_analysis_period ON installments_analysis(period_month);
CREATE INDEX idx_economic_indicators_period ON economic_indicators(period_month);

-- Create triggers
CREATE TRIGGER update_installments_analysis_updated_at
    BEFORE UPDATE ON installments_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_economic_indicators_updated_at
    BEFORE UPDATE ON economic_indicators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE installments_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE economic_indicators ENABLE ROW LEVEL SECURITY;

-- Policies for installments_analysis (linked to user through installments)
CREATE POLICY "Users can view their own installment analysis" ON installments_analysis
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM installments 
            WHERE installments.id = installments_analysis.installment_id 
            AND installments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own installment analysis" ON installments_analysis
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM installments 
            WHERE installments.id = installments_analysis.installment_id 
            AND installments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own installment analysis" ON installments_analysis
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM installments 
            WHERE installments.id = installments_analysis.installment_id 
            AND installments.user_id = auth.uid()
        )
    );

-- Policies for economic_indicators (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view economic indicators" ON economic_indicators
    FOR SELECT USING (auth.role() = 'authenticated');

-- Insert some initial economic indicators for testing
INSERT INTO economic_indicators (period_month, inflation_rate, accumulated_inflation, usd_official_rate, usd_blue_rate, purchasing_power_index, data_source) VALUES
('2024-01', 20.6, 20.6, 835.0, 1050.0, 100.0, 'manual'),
('2024-02', 13.2, 36.5, 860.0, 1045.0, 88.3, 'manual'),
('2024-03', 11.0, 51.6, 885.0, 1040.0, 79.6, 'manual'),
('2024-04', 8.8, 65.0, 910.0, 1035.0, 73.2, 'manual'),
('2024-05', 4.2, 72.0, 925.0, 1030.0, 70.3, 'manual'),
('2024-06', 4.6, 79.8, 940.0, 1025.0, 67.2, 'manual'),
('2024-07', 4.0, 87.0, 955.0, 1295.0, 64.6, 'manual'),
('2024-08', 4.2, 94.8, 970.0, 1320.0, 62.0, 'manual'),
('2024-09', 3.5, 101.6, 985.0, 1315.0, 59.9, 'manual'),
('2024-10', 2.7, 104.0, 1000.0, 1310.0, 58.3, 'manual'),
('2024-11', 2.4, 106.9, 1015.0, 1305.0, 56.9, 'manual'),
('2024-12', 2.5, 109.5, 1030.0, 1300.0, 55.5, 'manual'),
('2025-01', 2.3, 112.0, 1045.0, 1295.0, 54.3, 'manual'),
('2025-02', 2.1, 114.4, 1060.0, 1290.0, 53.2, 'manual'),
('2025-03', 1.9, 116.6, 1075.0, 1285.0, 52.2, 'manual'),
('2025-04', 1.8, 118.7, 1090.0, 1280.0, 51.3, 'manual'),
('2025-05', 1.7, 120.7, 1105.0, 1275.0, 50.4, 'manual'),
('2025-06', 1.6, 122.6, 1120.0, 1270.0, 49.6, 'manual'),
('2025-07', 1.5, 124.4, 1135.0, 1265.0, 48.9, 'manual'),
('2025-08', 1.4, 126.2, 1150.0, 1260.0, 48.2, 'manual'),
('2025-09', 1.3, 127.8, 1165.0, 1255.0, 47.6, 'manual');