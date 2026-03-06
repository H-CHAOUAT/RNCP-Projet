ALTER TABLE goals
    ADD COLUMN IF NOT EXISTS created_by_user_id BIGINT;

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