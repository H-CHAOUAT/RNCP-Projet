ALTER TABLE financial_profiles
    ADD COLUMN IF NOT EXISTS current_balance NUMERIC(12,2) NOT NULL DEFAULT 0;

UPDATE financial_profiles
SET current_balance = initial_balance
WHERE current_balance = 0;

ALTER TABLE financial_profiles
DROP COLUMN IF EXISTS initial_balance;
