CREATE TABLE t_p6387335_crm_forum_creation_2.posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username VARCHAR(50) NOT NULL,
    avatar_letter VARCHAR(2) NOT NULL DEFAULT 'U',
    avatar_color VARCHAR(20) NOT NULL DEFAULT '#a855f7',
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Общее',
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    views_count INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX posts_cat_idx ON t_p6387335_crm_forum_creation_2.posts(category);
CREATE INDEX posts_time_idx ON t_p6387335_crm_forum_creation_2.posts(created_at);
