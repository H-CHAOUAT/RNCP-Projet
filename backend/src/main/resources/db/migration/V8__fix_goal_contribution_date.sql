ALTER TABLE goal_contributions
ALTER COLUMN contribution_date TYPE DATE
USING contribution_date::date;