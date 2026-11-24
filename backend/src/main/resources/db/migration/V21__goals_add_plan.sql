-- Savings plan chosen for a goal at creation (amount per payday + which plan: On time / Aggressive / Relaxed).
-- Nullable: a goal legitimately has no plan until the user picks one.
ALTER TABLE goals
    ADD COLUMN IF NOT EXISTS plan_label VARCHAR(50),
    ADD COLUMN IF NOT EXISTS plan_amount_per_payday NUMERIC(12,2);
