CREATE TABLE IF NOT EXISTS family_invite_codes (
                                                   id              BIGSERIAL PRIMARY KEY,
                                                   code            VARCHAR(8) NOT NULL UNIQUE,
    family_group_id BIGINT NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
    created_by      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    used            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE INDEX IF NOT EXISTS idx_invite_code ON family_invite_codes(code);