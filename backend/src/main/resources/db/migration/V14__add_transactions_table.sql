CREATE TABLE IF NOT EXISTS transactions (
                                            id          BIGSERIAL PRIMARY KEY,
                                            user_id     BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type        VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    category    VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description VARCHAR(255),
    date        DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
