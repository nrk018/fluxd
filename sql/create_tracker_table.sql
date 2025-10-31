-- Create tracker table for loan application tracking
CREATE TABLE IF NOT EXISTS tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT UNIQUE NOT NULL DEFAULT 'LN-' || LPAD(CAST((EXTRACT(EPOCH FROM NOW())::BIGINT % 100000)::TEXT AS TEXT), 5, '0'),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'disbursed', 'completed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  next_step TEXT,
  current_stage TEXT DEFAULT 'submitted' CHECK (current_stage IN ('submitted', 'verification', 'review', 'approval', 'disbursement', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tracker_user_id ON tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_tracker_status ON tracker(status);
CREATE INDEX IF NOT EXISTS idx_tracker_application_id ON tracker(application_id);
CREATE INDEX IF NOT EXISTS idx_tracker_updated_at ON tracker(updated_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tracker_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tracker_updated_at
  BEFORE UPDATE ON tracker
  FOR EACH ROW
  EXECUTE FUNCTION update_tracker_updated_at();

-- Enable Row Level Security
ALTER TABLE tracker ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own tracker entries
CREATE POLICY "Users can view own tracker entries"
  ON tracker
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own tracker entries
CREATE POLICY "Users can insert own tracker entries"
  ON tracker
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own tracker entries
CREATE POLICY "Users can update own tracker entries"
  ON tracker
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

