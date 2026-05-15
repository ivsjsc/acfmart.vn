import { Pool } from 'pg';

// Initialize database connection from environment
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'acfmart_payments',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const migrations = [
  // Create transactions table
  `CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    order_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    buyer_phone VARCHAR(20) NOT NULL,
    redirect_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    psp_reference VARCHAR(255),
    idempotency_key VARCHAR(255) UNIQUE,
    webhook_signature TEXT,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // Create escrow_ledger table
  `CREATE TABLE IF NOT EXISTS escrow_ledger (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(255) NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('hold', 'release', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // Create webhooks_log table
  `CREATE TABLE IF NOT EXISTS webhooks_log (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(255) NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    signature TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // Create audit_log table
  `CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // Create indexes for performance
  `CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id ON transactions(transaction_id);`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_idempotency_key ON transactions(idempotency_key);`,
  `CREATE INDEX IF NOT EXISTS idx_escrow_ledger_transaction_id ON escrow_ledger(transaction_id);`,
  `CREATE INDEX IF NOT EXISTS idx_webhooks_log_processed ON webhooks_log(processed);`,
  `CREATE INDEX IF NOT EXISTS idx_webhooks_log_transaction_id ON webhooks_log(transaction_id);`,

  // Create trigger function for audit logging
  `CREATE OR REPLACE FUNCTION audit_trigger_function() RETURNS TRIGGER AS $$
  DECLARE
    old_values_json JSONB;
    new_values_json JSONB;
  BEGIN
    IF TG_OP = 'DELETE' THEN
      old_values_json := to_jsonb(OLD);
      -- Remove system columns from old values
      old_values_json := old_values_json - '{created_at,updated_at}';
      INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
      VALUES (TG_TABLE_NAME, OLD.transaction_id, TG_OP, old_values_json, NULL, USER);
      RETURN OLD;
    ELSIF TG_OP = 'INSERT' THEN
      new_values_json := to_jsonb(NEW);
      -- Remove system columns from new values
      new_values_json := new_values_json - '{created_at,updated_at}';
      INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
      VALUES (TG_TABLE_NAME, NEW.transaction_id, TG_OP, NULL, new_values_json, USER);
      RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
      old_values_json := to_jsonb(OLD);
      new_values_json := to_jsonb(NEW);
      -- Remove system columns from both old and new values
      old_values_json := old_values_json - '{created_at,updated_at}';
      new_values_json := new_values_json - '{created_at,updated_at}';
      INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
      VALUES (TG_TABLE_NAME, NEW.transaction_id, TG_OP, old_values_json, new_values_json, USER);
      RETURN NEW;
    END IF;
    RETURN NULL;
  END;
  $$ LANGUAGE plpgsql;`,

  // Create triggers for audit logging on transactions table
  `CREATE TRIGGER audit_transactions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();`
];

async function runMigrations() {
  console.log('Starting database migrations...');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (let i = 0; i < migrations.length; i++) {
      console.log(`Running migration ${i + 1}: ${migrations[i].substring(0, 60)}...`);
      await client.query(migrations[i]);
    }
    
    await client.query('COMMIT');
    console.log('All migrations completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);