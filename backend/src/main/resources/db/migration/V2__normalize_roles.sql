-- Make sure enum text matches your Java enum names
UPDATE users SET role = UPPER(role);

-- (Optional) helpful index; IF NOT EXISTS is safe
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
