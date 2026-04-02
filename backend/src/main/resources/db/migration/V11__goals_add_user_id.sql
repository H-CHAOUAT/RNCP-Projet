ALTER TABLE goals
    ADD COLUMN IF NOT EXISTS user_id BIGINT;

DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_catalog.pg_constraint
            WHERE conname = 'goals_user_id_fkey'
        ) THEN
            ALTER TABLE goals
                ADD CONSTRAINT goals_user_id_fkey
                    FOREIGN KEY (user_id)
                        REFERENCES users(user_id)
                        ON DELETE CASCADE;
        END IF;
    END $$;

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);