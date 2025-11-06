-- Create affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT[] NOT NULL,
  affiliate_url TEXT NOT NULL,
  commission_value NUMERIC NOT NULL DEFAULT 0,
  commission_type TEXT NOT NULL DEFAULT 'revshare', -- 'revshare', 'cpa', or 'none'
  cookie_days INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster category lookups
CREATE INDEX IF NOT EXISTS idx_affiliates_category ON affiliates USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_affiliates_active ON affiliates(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliates_commission ON affiliates(commission_value DESC);

-- Enable RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active affiliates
CREATE POLICY "Allow public read access to active affiliates"
  ON affiliates
  FOR SELECT
  USING (is_active = true);

