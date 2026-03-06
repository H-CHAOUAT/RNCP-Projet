-- 1) add column (nullable at first to avoid breaking existing rows)
ALTER TABLE goals
    ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;

-- 2) add FK (Postgres does NOT support "IF NOT EXISTS" on ADD CONSTRAINT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'goals_created_by_user_fkey'
    ) THEN
ALTER TABLE goals
    ADD CONSTRAINT goals_created_by_user_fkey
        FOREIGN KEY (created_by_user_id)
            REFERENCES users(user_id)
            ON DELETE SET NULL;
END IF;
END $$;