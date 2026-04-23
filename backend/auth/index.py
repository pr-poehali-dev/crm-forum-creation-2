"""
Аутентификация пользователей форума: регистрация, вход, получение профиля, выход.
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p6387335_crm_forum_creation_2")

COLORS = ["#a855f7", "#3b82f6", "#ec4899", "#00ff88", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"]

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    session_token = (event.get("headers") or {}).get("X-Session-Token", "")

    try:
        if method == "POST" and action == "register":
            return register(body)
        elif method == "POST" and action == "login":
            return login(body)
        elif method == "POST" and action == "logout":
            return logout(session_token)
        elif method == "GET" and action == "me":
            return get_me(session_token)
        else:
            return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Unknown action"})}
    except Exception as e:
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": str(e)})}


def register(body: dict) -> dict:
    username = (body.get("username") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not username or not email or not password:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Заполните все поля"})}
    if len(username) < 3:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Никнейм минимум 3 символа"})}
    if len(password) < 6:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Пароль минимум 6 символов"})}

    avatar_letter = username[0].upper()
    avatar_color = COLORS[len(username) % len(COLORS)]
    password_hash = hash_password(password)
    session_token = secrets.token_hex(32)

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (username, email, password_hash, avatar_letter, avatar_color, session_token) "
            f"VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, username, email, avatar_letter, avatar_color, role, reputation, posts_count, created_at",
            (username, email, password_hash, avatar_letter, avatar_color, session_token)
        )
        row = cur.fetchone()
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return {"statusCode": 409, "headers": CORS_HEADERS, "body": json.dumps({"error": "Никнейм или email уже занят"})}
    finally:
        cur.close()
        conn.close()

    user = {
        "id": row[0], "username": row[1], "email": row[2],
        "avatarLetter": row[3], "avatarColor": row[4],
        "role": row[5], "reputation": row[6], "postsCount": row[7],
        "createdAt": str(row[8]),
    }
    return {
        "statusCode": 200,
        "headers": {**CORS_HEADERS},
        "body": json.dumps({"user": user, "token": session_token}),
    }


def login(body: dict) -> dict:
    login_field = (body.get("login") or "").strip().lower()
    password = body.get("password") or ""

    if not login_field or not password:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Заполните все поля"})}

    password_hash = hash_password(password)
    session_token = secrets.token_hex(32)

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, username, email, avatar_letter, avatar_color, role, reputation, posts_count, is_blocked, created_at "
        f"FROM {SCHEMA}.users WHERE (LOWER(email) = %s OR LOWER(username) = %s) AND password_hash = %s",
        (login_field, login_field, password_hash)
    )
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Неверный логин или пароль"})}
    if row[8]:
        cur.close()
        conn.close()
        return {"statusCode": 403, "headers": CORS_HEADERS, "body": json.dumps({"error": "Ваш аккаунт заблокирован"})}

    cur.execute(f"UPDATE {SCHEMA}.users SET session_token = %s WHERE id = %s", (session_token, row[0]))
    conn.commit()
    cur.close()
    conn.close()

    user = {
        "id": row[0], "username": row[1], "email": row[2],
        "avatarLetter": row[3], "avatarColor": row[4],
        "role": row[5], "reputation": row[6], "postsCount": row[7],
        "createdAt": str(row[9]),
    }
    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"user": user, "token": session_token}),
    }


def get_me(session_token: str) -> dict:
    if not session_token:
        return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Не авторизован"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, username, email, avatar_letter, avatar_color, role, reputation, posts_count, created_at "
        f"FROM {SCHEMA}.users WHERE session_token = %s AND is_blocked = FALSE",
        (session_token,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {"statusCode": 401, "headers": CORS_HEADERS, "body": json.dumps({"error": "Сессия истекла"})}

    user = {
        "id": row[0], "username": row[1], "email": row[2],
        "avatarLetter": row[3], "avatarColor": row[4],
        "role": row[5], "reputation": row[6], "postsCount": row[7],
        "createdAt": str(row[8]),
    }
    return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"user": user})}


def logout(session_token: str) -> dict:
    if not session_token:
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"UPDATE {SCHEMA}.users SET session_token = NULL WHERE session_token = %s", (session_token,))
    conn.commit()
    cur.close()
    conn.close()
    return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True})}
