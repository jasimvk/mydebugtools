-- Lifetime ad-free purchases powered by Dodo Payments

CREATE TABLE IF NOT EXISTS ad_free_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT,
  dodo_payment_id TEXT UNIQUE,
  dodo_checkout_session_id TEXT,
  dodo_customer_id TEXT,
  dodo_product_id TEXT,
  webhook_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed', 'cancelled', 'refunded')),
  amount_cents INT NOT NULL DEFAULT 300,
  currency TEXT NOT NULL DEFAULT 'USD',
  purchased_at TIMESTAMPTZ,
  raw_event JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_free_purchases_user_id ON ad_free_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_free_purchases_email ON ad_free_purchases(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_ad_free_purchases_status ON ad_free_purchases(status);

ALTER TABLE ad_free_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own ad-free purchases" ON ad_free_purchases;
CREATE POLICY "Users can view own ad-free purchases"
  ON ad_free_purchases FOR SELECT
  USING (auth.uid()::uuid = user_id);

DROP TRIGGER IF EXISTS update_ad_free_purchases_updated_at ON ad_free_purchases;
CREATE TRIGGER update_ad_free_purchases_updated_at BEFORE UPDATE ON ad_free_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
