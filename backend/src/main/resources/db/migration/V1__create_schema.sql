-- ===========================================
--  V1__create_schema.sql
--  Initial schema for FinFam backend
-- ===========================================

CREATE TABLE IF NOT EXISTS family_groups (
                                             id BIGSERIAL PRIMARY KEY,
                                             name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS users (
                                     user_id BIGSERIAL PRIMARY KEY,
                                     first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    salary DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    family_group_id INT REFERENCES family_groups(id) ON DELETE SET NULL
    );

CREATE TABLE IF NOT EXISTS goals (
                                     id BIGSERIAL PRIMARY KEY,
                                     title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2) DEFAULT 0,
    current_amount DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    family_group_id INT REFERENCES family_groups(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS goal_contributions (
                                                  id BIGSERIAL PRIMARY KEY,
                                                  amount DECIMAL(10,2) NOT NULL,
    contribution_date TIMESTAMP DEFAULT NOW(),
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    goal_id INT REFERENCES goals(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS budgets (
                                       id BIGSERIAL PRIMARY KEY,
                                       name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    spent DECIMAL(10,2) DEFAULT 0,
    family_group_id INT REFERENCES family_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS bills (
                                     id BIGSERIAL PRIMARY KEY,
                                     title VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    paid BOOLEAN DEFAULT FALSE,
    family_group_id INT REFERENCES family_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    );
