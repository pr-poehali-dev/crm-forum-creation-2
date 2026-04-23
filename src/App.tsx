import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/5e4814d6-6634-4055-b8bb-c9f62e76e482";
const POSTS_URL = "https://functions.poehali.dev/35774357-8759-4fe4-a89a-584dc6cc1ddb";

type Page = "home" | "profile" | "rules" | "moderation";

interface User {
  id: number;
  username: string;
  email: string;
  avatarLetter: string;
  avatarColor: string;
  role: string;
  reputation: number;
  postsCount: number;
  createdAt: string;
}

interface Post {
  id: number;
  userId: number;
  author: string;
  avatar: string;
  color: string;
  title: string;
  preview: string;
  category: string;
  likes: number;
  comments: number;
  views: number;
  isPinned: boolean;
  time: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function authRequest(action: string, method: string, body?: object, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["X-Session-Token"] = token;
  const res = await fetch(`${AUTH_URL}?action=${action}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const raw = await res.json();
  const data = typeof raw === "string" ? JSON.parse(raw) : raw;
  return { ok: res.ok, data };
}

async function postsRequest(action: string, method: string, params?: Record<string, string>, body?: object, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["X-Session-Token"] = token;
  const qs = new URLSearchParams({ action, ...(params || {}) }).toString();
  const res = await fetch(`${POSTS_URL}?${qs}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const raw = await res.json();
  const data = typeof raw === "string" ? JSON.parse(raw) : raw;
  return { ok: res.ok, data };
}

// ─── Static data ──────────────────────────────────────────────────────────────

const DEMO_USERS = [
  { id: 1, name: "Артём_Про", avatar: "А", color: "#a855f7", posts: 284, rep: 1240, status: "активен", isBlocked: false },
  { id: 2, name: "Лена_Дизайн", avatar: "Л", color: "#ec4899", posts: 156, rep: 890, status: "активен", isBlocked: false },
  { id: 3, name: "СпамБот2000", avatar: "С", color: "#ef4444", posts: 3, rep: -50, status: "подозрительный", isBlocked: false },
  { id: 4, name: "Макс_Код", avatar: "М", color: "#3b82f6", posts: 98, rep: 560, status: "активен", isBlocked: false },
  { id: 5, name: "ТролльМод", avatar: "Т", color: "#f59e0b", posts: 12, rep: -120, status: "нарушитель", isBlocked: true },
];

const RULES = [
  { num: "01", title: "Уважение к участникам", desc: "Запрещены оскорбления, дискриминация и агрессия в любой форме. Относитесь к другим так, как хотите, чтобы относились к вам.", icon: "Heart", color: "#ec4899" },
  { num: "02", title: "Актуальный контент", desc: "Публикуйте материалы по теме раздела. Спам, реклама без согласования с администрацией и офтопик удаляются.", icon: "Target", color: "#a855f7" },
  { num: "03", title: "Достоверность информации", desc: "Проверяйте источники перед публикацией. Фейки и намеренная дезинформация — причина бана без предупреждения.", icon: "ShieldCheck", color: "#3b82f6" },
  { num: "04", title: "Авторские права", desc: "При использовании чужих материалов указывайте источник. Плагиат и копипаст без ссылки запрещены.", icon: "Copyright", color: "#00ff88" },
  { num: "05", title: "Конфиденциальность", desc: "Не публикуйте личные данные других пользователей без их согласия. Это касается фото, адресов, контактов.", icon: "Lock", color: "#f59e0b" },
  { num: "06", title: "Система предупреждений", desc: "1 предупреждение — устное замечание. 2 — ограничение на 7 дней. 3 — перманентный бан. Апелляции через поддержку.", icon: "AlertTriangle", color: "#ef4444" },
];

const CATEGORIES = ["Все", "Технологии", "Дизайн", "Программирование", "Бизнес", "Общее"];

// ─── Create Post Modal ────────────────────────────────────────────────────────

function CreatePostModal({ onClose, onCreated, token }: { onClose: () => void; onCreated: (post: Post) => void; token: string }) {
  const [form, setForm] = useState({ title: "", content: "", category: "Общее" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    if (!form.title.trim() || !form.content.trim()) { setError("Заполните заголовок и текст"); return; }
    setLoading(true);
    try {
      const { ok, data } = await postsRequest("create", "POST", {}, form, token);
      if (!ok) { setError(data.error || "Ошибка"); return; }
      onCreated(data.post);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-lg glass-card rounded-2xl p-7 animate-slide-up relative" style={{ border: "1px solid rgba(168,85,247,0.25)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors">
          <Icon name="X" size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
            <Icon name="PenLine" size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-oswald text-lg font-bold text-white">НОВАЯ ТЕМА</h2>
            <p className="text-white/40 text-xs">Поделитесь с сообществом</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white/50 text-xs mb-1 block">Заголовок</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="О чём ваша тема?"
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <div className="text-right text-xs text-white/25 mt-1">{form.title.length}/200</div>
          </div>

          <div>
            <label className="text-white/50 text-xs mb-1 block">Категория</label>
            <div className="flex flex-wrap gap-2">
              {["Технологии", "Дизайн", "Программирование", "Бизнес", "Общее"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => set("category", cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${form.category === cat ? "text-white" : "text-white/40 bg-white/5 hover:text-white/70"}`}
                  style={form.category === cat ? { background: "linear-gradient(135deg, #a855f7, #3b82f6)" } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs mb-1 block">Текст</label>
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Расскажите подробнее..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all resize-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg text-sm flex items-center gap-2" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
            <Icon name="AlertCircle" size={14} />{error}
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            Отмена
          </button>
          <button onClick={submit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
            {loading ? <><Icon name="Loader2" size={15} className="animate-spin" />Публикую...</> : <><Icon name="Send" size={15} />Опубликовать</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────

function AuthModal({ onClose, onAuth }: { onClose: () => void; onAuth: (user: User, token: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", email: "", login: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        const { ok, data } = await authRequest("register", "POST", { username: form.username, email: form.email, password: form.password });
        if (!ok) { setError(data.error || "Ошибка регистрации"); return; }
        onAuth(data.user, data.token);
      } else {
        const { ok, data } = await authRequest("login", "POST", { login: form.login, password: form.password });
        if (!ok) { setError(data.error || "Ошибка входа"); return; }
        onAuth(data.user, data.token);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md glass-card rounded-2xl p-8 animate-slide-up relative" style={{ border: "1px solid rgba(168,85,247,0.2)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors">
          <Icon name="X" size={20} />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
            <Icon name="Zap" size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-oswald text-xl font-bold text-white">{mode === "login" ? "ВХОД" : "РЕГИСТРАЦИЯ"}</h2>
            <p className="text-white/40 text-xs">{mode === "login" ? "Войдите в аккаунт" : "Создайте аккаунт"}</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          {(["login", "register"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? "text-white" : "text-white/40 hover:text-white/60"}`}
              style={mode === m ? { background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(59,130,246,0.2))" } : {}}>
              {m === "login" ? "Вход" : "Регистрация"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {mode === "register" && (
            <>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Никнейм</label>
                <input type="text" value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="Ваш никнейм"
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#a855f7")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#a855f7")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
              </div>
            </>
          )}
          {mode === "login" && (
            <div>
              <label className="text-white/50 text-xs mb-1 block">Никнейм или Email</label>
              <input type="text" value={form.login} onChange={(e) => set("login", e.target.value)} placeholder="Никнейм или email"
                className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                onFocus={(e) => (e.target.style.borderColor = "#a855f7")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
            </div>
          )}
          <div>
            <label className="text-white/50 text-xs mb-1 block">Пароль {mode === "register" && <span className="text-white/30">(минимум 6 символов)</span>}</label>
            <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={(e) => (e.target.style.borderColor = "#a855f7")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
        </div>

        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg text-sm flex items-center gap-2" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
            <Icon name="AlertCircle" size={14} />{error}
          </div>
        )}

        <button onClick={submit} disabled={loading}
          className="w-full mt-5 py-3 rounded-xl font-semibold text-white text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
          {loading ? <><Icon name="Loader2" size={16} className="animate-spin" />Загрузка...</> : mode === "login" ? "Войти" : "Зарегистрироваться"}
        </button>
      </div>
    </div>
  );
}

// ─── NavBar ───────────────────────────────────────────────────────────────────

function NavBar({ page, setPage, user, onAuthClick, onLogout, onCreatePost }: {
  page: Page; setPage: (p: Page) => void;
  user: User | null; onAuthClick: () => void; onLogout: () => void; onCreatePost: () => void;
}) {
  const nav = [
    { id: "home" as Page, label: "Главная", icon: "Home" },
    { id: "profile" as Page, label: "Профиль", icon: "User" },
    { id: "rules" as Page, label: "Правила", icon: "BookOpen" },
    { id: "moderation" as Page, label: "Модерация", icon: "Shield" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ background: "rgba(10,11,16,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center animate-pulse-neon" style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
            <Icon name="Zap" size={16} className="text-white" />
          </div>
          <span className="font-oswald font-bold text-xl tracking-widest text-white">ФОРУМ</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((item) => (
            <button key={item.id} onClick={() => setPage(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${page === item.id ? "text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}
              style={page === item.id ? { background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.2))", color: "#a855f7" } : {}}>
              <Icon name={item.icon} size={15} />{item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <button onClick={onCreatePost}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
              <Icon name="Plus" size={15} />
              <span className="hidden md:inline">Создать тему</span>
            </button>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setPage("profile")} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ background: `${user.avatarColor}40`, border: `1px solid ${user.avatarColor}40` }}>
                  {user.avatarLetter}
                </div>
                <span className="text-white/80 text-sm font-medium hidden md:block">{user.username}</span>
              </button>
              <button onClick={onLogout} className="text-white/30 hover:text-white/60 transition-colors" title="Выйти">
                <Icon name="LogOut" size={18} />
              </button>
            </div>
          ) : (
            <button onClick={onAuthClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
              <Icon name="LogIn" size={15} />Войти
            </button>
          )}
        </div>
      </div>

      <div className="md:hidden flex border-t border-white/5">
        {nav.map((item) => (
          <button key={item.id} onClick={() => setPage(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-all ${page === item.id ? "text-purple-400" : "text-white/40"}`}>
            <Icon name={item.icon} size={18} />{item.label}
          </button>
        ))}
      </div>
    </header>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, index, onLike, onHide, canHide }: {
  post: Post; index: number;
  onLike: (id: number) => void;
  onHide: (id: number) => void;
  canHide: boolean;
}) {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    if (liked) return;
    setLiked(true);
    onLike(post.id);
  };

  return (
    <div className="glass-card rounded-xl p-5 transition-all duration-200 animate-slide-up group" style={{ animationDelay: `${index * 0.06}s` }}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: `${post.color}30`, border: `1px solid ${post.color}40` }}>
          {post.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {post.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>
                <Icon name="Pin" size={10} /> Закреплено
              </span>
            )}
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>{post.category}</span>
          </div>
          <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors mb-1 text-base">{post.title}</h3>
          <p className="text-white/40 text-sm line-clamp-2">{post.preview}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-white/35">
            <span className="font-medium" style={{ color: post.color }}>{post.author}</span>
            <span>{post.time}</span>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition-all ${liked ? "text-pink-400" : "hover:text-pink-400"}`}
            >
              <Icon name={liked ? "HeartHandshake" : "Heart"} size={12} />{post.likes + (liked ? 1 : 0)}
            </button>
            <div className="flex items-center gap-1"><Icon name="MessageSquare" size={12} />{post.comments}</div>
            <div className="flex items-center gap-1"><Icon name="Eye" size={12} />{post.views}</div>
            {canHide && (
              <button onClick={() => onHide(post.id)} className="flex items-center gap-1 ml-auto text-white/20 hover:text-red-400 transition-colors">
                <Icon name="Trash2" size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({ user, onAuthClick, onCreatePost, token }: {
  user: User | null; onAuthClick: () => void; onCreatePost: () => void; token: string;
}) {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async (cat: string) => {
    setLoading(true);
    const params: Record<string, string> = { limit: "20" };
    if (cat !== "Все") params.category = cat;
    const { data } = await postsRequest("list", "GET", params);
    setPosts(data.posts || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(activeCategory); }, [activeCategory, fetchPosts]);

  const handleLike = async (id: number) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    await postsRequest("like", "POST", { id: String(id) });
  };

  const handleHide = async (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    await postsRequest("hide", "POST", { id: String(id) }, undefined, token);
  };

  const canHide = user?.role === "moderator" || user?.role === "admin";

  return (
    <div className="animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl mb-8 p-8 grid-bg" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(59,130,246,0.08))" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", border: "1px solid rgba(0,255,136,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            Сообщество онлайн
          </div>
          <h1 className="font-oswald text-4xl md:text-5xl font-bold text-white mb-3 tracking-wide">
            ДОБРО ПОЖАЛОВАТЬ<br /><span className="neon-text-purple">В СООБЩЕСТВО</span>
          </h1>
          <p className="text-white/60 text-lg max-w-lg mb-5">Место, где идеи становятся обсуждениями, а незнакомцы — единомышленниками.</p>
          {!user ? (
            <button onClick={onAuthClick} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
              <Icon name="UserPlus" size={16} />Присоединиться
            </button>
          ) : (
            <button onClick={onCreatePost} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
              <Icon name="PenLine" size={16} />Создать тему
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === cat ? "text-white" : "text-white/50 hover:text-white/80 bg-white/5"}`}
            style={activeCategory === cat ? { background: "linear-gradient(135deg, #a855f7, #3b82f6)" } : {}}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(168,85,247,0.1)" }}>
            <Icon name="MessageSquarePlus" size={28} className="text-purple-400" />
          </div>
          <p className="text-white/40 mb-4">Тем ещё нет. Будьте первым!</p>
          {user && (
            <button onClick={onCreatePost} className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
              Создать первую тему
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} onLike={handleLike} onHide={handleHide} canHide={canHide} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

function ProfilePage({ user, onAuthClick, token }: { user: User | null; onAuthClick: () => void; token: string }) {
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingPosts(true);
    postsRequest("list", "GET", { limit: "50" }).then(({ data }) => {
      const mine = (data.posts || []).filter((p: Post) => p.userId === user.id);
      setMyPosts(mine);
      setLoadingPosts(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(168,85,247,0.1)" }}>
          <Icon name="User" size={32} className="text-purple-400" />
        </div>
        <h2 className="font-oswald text-2xl font-bold text-white mb-2">ВОЙДИТЕ В АККАУНТ</h2>
        <p className="text-white/50 mb-6">Чтобы увидеть профиль, нужно авторизоваться</p>
        <button onClick={onAuthClick} className="px-6 py-3 rounded-xl font-semibold text-white text-sm" style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
          Войти или зарегистрироваться
        </button>
      </div>
    );
  }

  const handleHideOwn = async (id: number) => {
    setMyPosts((prev) => prev.filter((p) => p.id !== id));
    await postsRequest("hide", "POST", { id: String(id) }, undefined, token);
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-card rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), transparent 60%)" }} />
        <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl font-oswald" style={{ background: `linear-gradient(135deg, ${user.avatarColor}, #3b82f6)` }}>
              {user.avatarLetter}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background" style={{ background: "#00ff88" }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-oswald text-2xl font-bold text-white">{user.username}</h2>
              {user.role === "moderator" && <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: "rgba(168,85,247,0.2)", color: "#a855f7" }}>МОДЕРАТОР</span>}
            </div>
            <p className="text-white/50 text-sm mb-1">Участник с {new Date(user.createdAt).toLocaleDateString("ru-RU")}</p>
            <p className="text-white/50 text-sm">{user.email}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Постов", val: myPosts.length || user.postsCount },
              { label: "Репутация", val: user.reputation },
              { label: "Лайков", val: myPosts.reduce((s, p) => s + p.likes, 0) },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-oswald text-xl font-bold text-white">{s.val}</div>
                <div className="text-xs text-white/40">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="font-oswald text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Icon name="FileText" size={18} className="text-purple-400" />
        МОИ ТЕМЫ
        <span className="text-white/30 text-sm font-golos font-normal">({myPosts.length})</span>
      </h3>

      {loadingPosts ? (
        <div className="glass-card rounded-xl p-5 animate-pulse">
          <div className="h-4 bg-white/5 rounded w-1/2 mb-2" /><div className="h-3 bg-white/5 rounded w-full" />
        </div>
      ) : myPosts.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center text-white/30">
          <Icon name="PenLine" size={28} className="mx-auto mb-2 opacity-30" />
          <p>Вы ещё не создавали тем</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myPosts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} onLike={() => {}} onHide={handleHideOwn} canHide={true} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rules Page ───────────────────────────────────────────────────────────────

function RulesPage() {
  const [openRule, setOpenRule] = useState<number | null>(null);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.2)" }}>
          <Icon name="BookOpen" size={12} />Обновлено 10 апреля 2026
        </div>
        <h1 className="font-oswald text-4xl font-bold text-white mb-3">ПРАВИЛА И ГАЙДЛАЙНЫ</h1>
        <p className="text-white/50 max-w-xl">Эти правила созданы чтобы форум оставался местом уважительного и продуктивного общения для всех участников.</p>
      </div>

      <div className="glass-card rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(59,130,246,0.05))" }} />
        <div className="relative">
          <h3 className="font-oswald text-lg font-bold text-white mb-4">КОРОТКО О ГЛАВНОМ</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { emoji: "✅", text: "Уважай других участников" },
              { emoji: "📝", text: "Публикуй релевантный контент" },
              { emoji: "🔗", text: "Указывай источники" },
              { emoji: "🚫", text: "Не спамь и не рекламируй" },
              { emoji: "🔒", text: "Не раскрывай личные данные" },
              { emoji: "⚡", text: "3 нарушения — бан навсегда" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                <span className="text-lg">{item.emoji}</span>{item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {RULES.map((rule, i) => (
          <div key={i} className="glass-card rounded-xl overflow-hidden cursor-pointer animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => setOpenRule(openRule === i ? null : i)}>
            <div className="p-5 flex items-center gap-4">
              <div className="font-oswald text-3xl font-bold opacity-20 text-white w-10 flex-shrink-0">{rule.num}</div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${rule.color}20` }}>
                <Icon name={rule.icon} size={18} style={{ color: rule.color }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{rule.title}</h3>
                {openRule !== i && <p className="text-white/40 text-sm line-clamp-1 mt-0.5">{rule.desc}</p>}
              </div>
              <Icon name={openRule === i ? "ChevronUp" : "ChevronDown"} size={18} className="text-white/30 flex-shrink-0" />
            </div>
            {openRule === i && (
              <div className="px-5 pb-5 pt-0">
                <div className="h-px w-full mb-4" style={{ background: `linear-gradient(90deg, ${rule.color}40, transparent)` }} />
                <p className="text-white/65 text-sm leading-relaxed">{rule.desc}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-xl border text-center" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
        <Icon name="AlertTriangle" size={24} className="mx-auto mb-2 text-red-400" />
        <p className="text-white/70 text-sm">Незнание правил не освобождает от ответственности. При спорных ситуациях обращайтесь к модераторам.</p>
      </div>
    </div>
  );
}

// ─── Moderation Page ──────────────────────────────────────────────────────────

function ModerationPage({ user, onAuthClick, token }: { user: User | null; onAuthClick: () => void; token: string }) {
  const [modUsers, setModUsers] = useState(DEMO_USERS);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [deletedCount, setDeletedCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
  const [notification, setNotification] = useState<string | null>(null);

  const notify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  useEffect(() => {
    if (!user) return;
    postsRequest("list", "GET", { limit: "50" }).then(({ data }) => {
      setPosts(data.posts || []);
      setLoadingPosts(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(239,68,68,0.1)" }}>
          <Icon name="Shield" size={32} className="text-red-400" />
        </div>
        <h2 className="font-oswald text-2xl font-bold text-white mb-2">ДОСТУП ЗАКРЫТ</h2>
        <p className="text-white/50 mb-6">Войдите в аккаунт для доступа к панели модерации</p>
        <button onClick={onAuthClick} className="px-6 py-3 rounded-xl font-semibold text-white text-sm" style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
          Войти или зарегистрироваться
        </button>
      </div>
    );
  }

  const handleHide = async (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeletedCount((n) => n + 1);
    await postsRequest("hide", "POST", { id: String(id) }, undefined, token);
    notify("Пост удалён");
  };

  return (
    <div className="animate-fade-in">
      {notification && (
        <div className="fixed top-20 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium animate-slide-up" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.9), rgba(59,130,246,0.9))", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-2"><Icon name="CheckCircle" size={16} />{notification}</div>
        </div>
      )}

      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
          <Icon name="Shield" size={12} />Панель модератора · {user.username}
        </div>
        <h1 className="font-oswald text-4xl font-bold text-white mb-3">СИСТЕМА МОДЕРАЦИИ</h1>
        <p className="text-white/50">Управляйте контентом и участниками сообщества.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Постов в ленте", val: posts.length.toString(), color: "#3b82f6", icon: "FileText" },
          { label: "Удалено", val: deletedCount.toString(), color: "#f59e0b", icon: "Trash2" },
          { label: "Заблокировано", val: modUsers.filter((u) => u.isBlocked).length.toString(), color: "#a855f7", icon: "UserX" },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon name={s.icon} size={15} style={{ color: s.color }} />
              <span className="text-white/40 text-xs">{s.label}</span>
            </div>
            <div className="font-oswald text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
        {[{ id: "posts" as const, label: "Посты", icon: "FileText" }, { id: "users" as const, label: "Пользователи", icon: "Users" }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white/70"}`}
            style={activeTab === tab.id ? { background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(59,130,246,0.2))" } : {}}>
            <Icon name={tab.icon} size={15} />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "posts" && (
        <div className="space-y-3">
          {loadingPosts && <div className="glass-card rounded-xl p-5 animate-pulse"><div className="h-4 bg-white/5 rounded w-1/2" /></div>}
          {!loadingPosts && posts.length === 0 && (
            <div className="text-center py-12 text-white/30">
              <Icon name="CheckCircle" size={40} className="mx-auto mb-3 opacity-30" /><p>Нет постов для модерации</p>
            </div>
          )}
          {posts.map((post, i) => (
            <div key={post.id} className="glass-card rounded-xl p-4 flex items-start gap-4 animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: `${post.color}30` }}>
                {post.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-white text-sm">{post.title}</h4>
                    <p className="text-white/40 text-xs mt-0.5">{post.author} · {post.time} · <span style={{ color: "rgba(168,85,247,0.7)" }}>{post.category}</span></p>
                  </div>
                  <button onClick={() => handleHide(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <Icon name="Trash2" size={12} />Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-3">
          {modUsers.map((u, i) => (
            <div key={u.id} className={`glass-card rounded-xl p-4 flex items-center gap-4 animate-slide-up transition-all ${u.isBlocked ? "opacity-50" : ""}`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: `${u.color}30`, border: `1px solid ${u.color}30` }}>
                {u.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-white text-sm">{u.name}</span>
                  {u.isBlocked && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>Заблокирован</span>}
                  {u.status === "подозрительный" && !u.isBlocked && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>⚠️ Подозрительный</span>}
                  {u.status === "нарушитель" && !u.isBlocked && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>🚫 Нарушитель</span>}
                </div>
                <p className="text-white/40 text-xs">{u.posts} постов · Репутация: <span style={{ color: u.rep >= 0 ? "#00ff88" : "#ef4444" }}>{u.rep > 0 ? "+" : ""}{u.rep}</span></p>
              </div>
              <button
                onClick={() => { setModUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, isBlocked: !x.isBlocked } : x)); notify(u.isBlocked ? `${u.name} разблокирован` : `${u.name} заблокирован`); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={u.isBlocked ? { background: "rgba(0,255,136,0.15)", color: "#00ff88", border: "1px solid rgba(0,255,136,0.2)" } : { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                <Icon name={u.isBlocked ? "UserCheck" : "UserX"} size={12} />
                {u.isBlocked ? "Разблокировать" : "Заблокировать"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("forum_token");
    if (saved) {
      setToken(saved);
      authRequest("me", "GET", undefined, saved).then(({ ok, data }) => {
        if (ok) setUser(data.user);
        else { localStorage.removeItem("forum_token"); setToken(""); }
      });
    }
  }, []);

  const handleAuth = (u: User, t: string) => {
    setUser(u); setToken(t);
    localStorage.setItem("forum_token", t);
    setShowAuth(false);
  };

  const handleLogout = async () => {
    if (token) await authRequest("logout", "POST", undefined, token);
    setUser(null); setToken("");
    localStorage.removeItem("forum_token");
  };

  const handleCreated = (post: Post) => {
    setShowCreate(false);
    setPage("home");
  };

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage user={user} onAuthClick={() => setShowAuth(true)} onCreatePost={() => setShowCreate(true)} token={token} />;
      case "profile": return <ProfilePage user={user} onAuthClick={() => setShowAuth(true)} token={token} />;
      case "rules": return <RulesPage />;
      case "moderation": return <ModerationPage user={user} onAuthClick={() => setShowAuth(true)} token={token} />;
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <NavBar page={page} setPage={setPage} user={user} onAuthClick={() => setShowAuth(true)} onLogout={handleLogout} onCreatePost={() => setShowCreate(true)} />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">{renderPage()}</main>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />}
      {showCreate && user && <CreatePostModal onClose={() => setShowCreate(false)} onCreated={handleCreated} token={token} />}
    </div>
  );
}
