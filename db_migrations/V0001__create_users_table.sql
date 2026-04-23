CREATE TABLE t_p6387335_crm_forum_creation_2.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_letter VARCHAR(2) NOT NULL DEFAULT 'U',
    avatar_color VARCHAR(20) NOT NULL DEFAULT '#a855f7',
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    reputation INTEGER NOT NULL DEFAULT 0,
    posts_count INTEGER NOT NULL DEFAULT 0,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    session_token VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
