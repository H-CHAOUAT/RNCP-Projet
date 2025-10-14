-- Make sure enum text matches your Java enum names
UPDATE users SET role = UPPER(role);

-- (Optional) helpful index; IF NOT EXISTS is safe
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert default users only if they don't already exist
INSERT INTO users (first_name, last_name, email, password, role, salary, balance, created_at, updated_at)
SELECT 'Hala', 'CHAOUAT', 'hala@test.com', '$2a$10$KCrQqOYrkhEw4wZ6gBL97uH9YRWHPqYav8/IrI7LBgK7K0eakxj8K', 'PARENT', 0, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'hala@test.com');

INSERT INTO users (first_name, last_name, email, password, role, salary, balance, created_at, updated_at)
SELECT 'System', 'Admin', 'admin@test.com', '$2a$10$8Yk9J9hTVQF1tR7jEgr8DugIo5M2ClYjvHeD5KXk7VR2/ZxWjU7Re', 'ADMIN', 0, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@test.com');
