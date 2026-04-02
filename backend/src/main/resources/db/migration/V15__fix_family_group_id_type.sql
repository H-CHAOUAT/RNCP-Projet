ALTER TABLE users
ALTER COLUMN family_group_id TYPE BIGINT USING family_group_id::BIGINT;

ALTER TABLE goals
ALTER COLUMN family_group_id TYPE BIGINT USING family_group_id::BIGINT;

ALTER TABLE budgets
ALTER COLUMN family_group_id TYPE BIGINT USING family_group_id::BIGINT;

ALTER TABLE bills
ALTER COLUMN family_group_id TYPE BIGINT USING family_group_id::BIGINT;
