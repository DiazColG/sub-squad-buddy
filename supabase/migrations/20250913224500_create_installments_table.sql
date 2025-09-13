-- Create installments table
CREATE TABLE installments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    purchase_name text NOT NULL,
    total_amount decimal(12,2) NOT NULL,
    installment_amount decimal(12,2) NOT NULL,
    total_installments integer NOT NULL,
    paid_installments integer DEFAULT 0 NOT NULL,
    due_day integer NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
    card_id uuid REFERENCES cards(id) ON DELETE SET NULL,
    category text DEFAULT 'general',
    purchase_date date NOT NULL,
    next_due_date date NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_installments_user_id ON installments(user_id);
CREATE INDEX idx_installments_status ON installments(status);
CREATE INDEX idx_installments_next_due_date ON installments(next_due_date);
CREATE INDEX idx_installments_card_id ON installments(card_id);

-- Create trigger for updated_at
CREATE TRIGGER update_installments_updated_at
    BEFORE UPDATE ON installments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own installments" ON installments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own installments" ON installments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own installments" ON installments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own installments" ON installments
    FOR DELETE USING (auth.uid() = user_id);