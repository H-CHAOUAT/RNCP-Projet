ALTER TABLE goals
    ADD COLUMN IF NOT EXISTS target_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE goal_contributions
    ADD COLUMN IF NOT EXISTS contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_goal_contrib_goal'
    ) THEN
ALTER TABLE goal_contributions
    ADD CONSTRAINT fk_goal_contrib_goal
        FOREIGN KEY (goal_id) REFERENCES goals(id)
            ON DELETE CASCADE;
END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_goal_contrib_user'
    ) THEN
ALTER TABLE goal_contributions
    ADD CONSTRAINT fk_goal_contrib_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
            ON DELETE CASCADE;
END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_goal_contrib_goal ON goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_contrib_user ON goal_contributions(user_id);