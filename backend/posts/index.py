"""
Управление постами форума: создание, получение списка, удаление модератором, лайки.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p6387335_crm_forum_creation_2")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_by_token(cur, token):
    if not token:
        return None
    cur.execute(
        f"SELECT id, username, avatar_letter, avatar_color, role, is_blocked "
        f"FROM {SCHEMA}.users WHERE session_token = %s",
        (token,)
    )
    row = cur.fetchone()
    if not row or row[5]:
        return None
    return {"id": row[0], "username": row[1], "avatarLetter": row[2], "avatarColor": row[3], "role": row[4]}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "list")
    token = (event.get("headers") or {}).get("X-Session-Token", "")

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    conn = get_conn()
    cur = conn.cursor()
    try:
        if method == "GET" and action == "list":
            return list_posts(cur, params)
        elif method == "POST" and action == "create":
            user = get_user_by_token(cur, token)
            if not user:
                return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Не авторизован"})}
            return create_post(cur, conn, user, body)
        elif method == "POST" and action == "hide":
            user = get_user_by_token(cur, token)
            if not user:
                return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Не авторизован"})}
            return hide_post(cur, conn, user, params.get("id", ""))
        elif method == "POST" and action == "like":
            return like_post(cur, conn, params.get("id", ""))
        else:
            return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Unknown action"})}
    finally:
        cur.close()
        conn.close()


def list_posts(cur, params):
    category = params.get("category", "")
    limit = min(int(params.get("limit", 20)), 50)

    if category and category != "Все":
        cur.execute(
            f"SELECT id, user_id, username, avatar_letter, avatar_color, title, content, category, "
            f"likes_count, comments_count, views_count, is_pinned, created_at "
            f"FROM {SCHEMA}.posts WHERE is_hidden = FALSE AND category = %s "
            f"ORDER BY is_pinned DESC, created_at DESC LIMIT %s",
            (category, limit)
        )
    else:
        cur.execute(
            f"SELECT id, user_id, username, avatar_letter, avatar_color, title, content, category, "
            f"likes_count, comments_count, views_count, is_pinned, created_at "
            f"FROM {SCHEMA}.posts WHERE is_hidden = FALSE "
            f"ORDER BY is_pinned DESC, created_at DESC LIMIT %s",
            (limit,)
        )

    rows = cur.fetchall()
    posts = []
    for r in rows:
        posts.append({
            "id": r[0], "userId": r[1], "author": r[2],
            "avatar": r[3], "color": r[4],
            "title": r[5], "preview": r[6][:120] + "..." if len(r[6]) > 120 else r[6],
            "category": r[7],
            "likes": r[8], "comments": r[9], "views": r[10],
            "isPinned": r[11],
            "time": r[12].strftime("%d.%m.%Y %H:%M"),
        })
    return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"posts": posts})}


def create_post(cur, conn, user, body):
    title = (body.get("title") or "").strip()
    content = (body.get("content") or "").strip()
    category = (body.get("category") or "Общее").strip()

    if not title or not content:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Заполните заголовок и текст"})}
    if len(title) > 200:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Заголовок слишком длинный"})}

    cur.execute(
        f"INSERT INTO {SCHEMA}.posts (user_id, username, avatar_letter, avatar_color, title, content, category) "
        f"VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id, created_at",
        (user["id"], user["username"], user["avatarLetter"], user["avatarColor"], title, content, category)
    )
    row = cur.fetchone()
    cur.execute(f"UPDATE {SCHEMA}.users SET posts_count = posts_count + 1 WHERE id = %s", (user["id"],))
    conn.commit()

    post = {
        "id": row[0], "userId": user["id"], "author": user["username"],
        "avatar": user["avatarLetter"], "color": user["avatarColor"],
        "title": title, "preview": content[:120] + "..." if len(content) > 120 else content,
        "category": category, "likes": 0, "comments": 0, "views": 0,
        "isPinned": False, "time": row[1].strftime("%d.%m.%Y %H:%M"),
    }
    return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"post": post})}


def hide_post(cur, conn, user, post_id):
    if not post_id:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Не указан ID поста"})}

    cur.execute(f"SELECT user_id FROM {SCHEMA}.posts WHERE id = %s", (int(post_id),))
    row = cur.fetchone()
    if not row:
        return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Пост не найден"})}

    if user["role"] not in ("moderator", "admin") and row[0] != user["id"]:
        return {"statusCode": 403, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нет прав"})}

    cur.execute(f"UPDATE {SCHEMA}.posts SET is_hidden = TRUE WHERE id = %s", (int(post_id),))
    conn.commit()
    return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True})}


def like_post(cur, conn, post_id):
    if not post_id:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Не указан ID"})}
    cur.execute(
        f"UPDATE {SCHEMA}.posts SET likes_count = likes_count + 1 WHERE id = %s AND is_hidden = FALSE RETURNING likes_count",
        (int(post_id),)
    )
    row = cur.fetchone()
    conn.commit()
    if not row:
        return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Пост не найден"})}
    return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"likes": row[0]})}
