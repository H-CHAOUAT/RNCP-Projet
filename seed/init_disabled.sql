-- Drop old tables if they exist
DROP TABLE IF EXISTS goal_contributions CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS family_groups CASCADE;

-- Family groups
CREATE TABLE family_groups (
    family_id SERIAL PRIMARY KEY,
    family_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(20) CHECK (role IN ('parent', 'partner', 'child')),
    salary NUMERIC(10,2) DEFAULT 0,
    balance NUMERIC(10,2) DEFAULT 0,
    family_id INT REFERENCES family_groups(family_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets
CREATE TABLE budgets (
    budget_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    is_shared BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(10) CHECK (visibility IN ('public', 'private')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals
CREATE TABLE goals (
    goal_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    budget_id INT REFERENCES budgets(budget_id) ON DELETE SET NULL,
    title VARCHAR(100) NOT NULL,
    target_amount NUMERIC(10,2) NOT NULL,
    deadline DATE,
    progress NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bills
CREATE TABLE bills (
    bill_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    budget_id INT REFERENCES budgets(budget_id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    amount NUMERIC(10,2) NOT NULL,
    bill_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goal contributions (monthly savings towards a goal)
CREATE TABLE goal_contributions (
    contribution_id SERIAL PRIMARY KEY,
    goal_id INT REFERENCES goals(goal_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    contribution_date DATE DEFAULT CURRENT_DATE
);

-- 🔹 Seed some initial data
INSERT INTO family_groups (family_name) VALUES
('Smith Family'),
('Johnson Family');

INSERT INTO users (first_name, last_name, email, password, role, salary, balance, family_id)
VALUES
('John', 'Smith', 'john@example.com', 'password123', 'parent', 5000, 2000, 1),
('Jane', 'Smith', 'jane@example.com', 'password123', 'partner', 4500, 1800, 1),
('Mike', 'Johnson', 'mike@example.com', 'password123', 'parent', 6000, 2500, 2);

INSERT INTO budgets (user_id, title, amount, is_shared, visibility)
VALUES
(1, 'Household Expenses', 3000, TRUE, 'public'),
(2, 'Personal Savings', 1500, FALSE, 'private'),
(3, 'Vacation Fund', 2000, TRUE, 'public');

INSERT INTO goals (user_id, budget_id, title, target_amount, deadline, progress)
VALUES
(1, 3, 'Trip to Paris', 5000, '2026-06-01', 1000),
(2, 2, 'New Laptop', 1200, '2025-12-01', 400),
(3, 1, 'Emergency Fund', 3000, '2025-09-01', 500);

INSERT INTO bills (user_id, budget_id, category, description, amount, bill_date)
VALUES
(1, 1, 'Utilities', 'Electricity Bill', 200, '2025-09-01'),
(1, 1, 'Groceries', 'Supermarket shopping', 350, '2025-09-05'),
(2, 2, 'Subscriptions', 'Netflix', 15, '2025-09-01'),
(3, 1, 'Rent', 'Monthly rent payment', 1200, '2025-09-01');

INSERT INTO goal_contributions (goal_id, user_id, amount, contribution_date)
VALUES
(1, 1, 500, '2025-09-01'),
(1, 1, 500, '2025-10-01'),
(2, 2, 200, '2025-09-01'),
(3, 3, 300, '2025-09-01');