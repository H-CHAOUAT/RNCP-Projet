CREATE TABLE IF NOT EXISTS financial_profiles (
                                                  id BIGSERIAL PRIMARY KEY,
                                                  user_id BIGINT NOT NULL UNIQUE,
                                                  monthly_income NUMERIC(19,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_fin_profile_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS expense_items (
                                             id BIGSERIAL PRIMARY KEY,
                                             financial_profile_id BIGINT NOT NULL,
                                             category VARCHAR(50) NOT NULL,
    amount NUMERIC(19,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_exp_profile FOREIGN KEY (financial_profile_id) REFERENCES financial_profiles(id) ON DELETE CASCADE
    );
