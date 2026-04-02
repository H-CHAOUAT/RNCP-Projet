ALTER TABLE goals
DROP CONSTRAINT IF EXISTS goals_family_group_id_fkey;

ALTER TABLE goals
ALTER COLUMN family_group_id TYPE BIGINT
  USING family_group_id::bigint;

ALTER TABLE goals
    ADD CONSTRAINT goals_family_group_id_fkey
        FOREIGN KEY (family_group_id) REFERENCES family_groups(id)
            ON DELETE SET NULL;