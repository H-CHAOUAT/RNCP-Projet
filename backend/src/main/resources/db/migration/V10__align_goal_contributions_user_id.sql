ALTER TABLE goal_contributions
DROP CONSTRAINT IF EXISTS goal_contributions_user_id_fkey;

ALTER TABLE goal_contributions
ALTER COLUMN user_id TYPE BIGINT;

ALTER TABLE goal_contributions
    ADD CONSTRAINT goal_contributions_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(user_id)
            ON DELETE CASCADE;

ALTER TABLE goal_contributions
DROP CONSTRAINT IF EXISTS goal_contributions_goal_id_fkey;

ALTER TABLE goal_contributions
    ADD CONSTRAINT goal_contributions_goal_id_fkey
        FOREIGN KEY (goal_id) REFERENCES goals(id)
            ON DELETE CASCADE;