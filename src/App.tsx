import { useState } from "react";
import Icon from "@/components/ui/icon";

type Page = "home" | "profile" | "rules" | "moderation";

const POSTS = [
  {
    id: 1,
    author: "Артём_Про",
    avatar: "А",
    color: "#a855f7",
    category: "Технологии",
    title: "Как ИИ меняет разработку в 2026 году",
    preview: "Разбираем актуальные инструменты и тренды, которые уже сейчас влияют на работу каждого разработчика...",
    likes: 284,
    comments: 47,
    views: 3200,
    time: "2 ч назад",
    isPinned: true,
    isHot: true,
  },
  {
    id: 2,
    author: "Лена_Дизайн",
    avatar: "Л",
    color: "#ec4899",
    category: "Дизайн",
    title: "Glassmorphism vs Neumorphism: что актуально сейчас",
    preview: "Сравниваю два тренда, их применение в реальных проектах и когда стоит отказаться от обоих...",
    likes: 156,
    comments: 32,
    views: 1890,
    time: "5 ч назад",
    isPinned: false,
    isHot: true,
  },
  {
    id: 3,
    author: "Макс_Код",
    avatar: "М",
    color: "#3b82f6",
    category: "Программирование",
    title: "React 19 — всё что нужно знать",
    preview: "Новые хуки, изменения в рендеринге и что это значит для ваших текущих проектов на практике...",
    likes: 98,
    comments: 21,
    views: 1240,
    time: "1 д назад",
    isPinned: false,
    isHot: false,
  },
  {
    id: 4,
    author: "Даша_StartUp",
    avatar: "Д",
    color: "#00ff88",
    category: "Бизнес",
    title: "Запустила MVP за 3 дня — честный отчёт",
    preview: "Без команды, с минимальным бюджетом и максимумом кофе. Рассказываю что получилось и что провалилось...",
    likes: 342,
    comments: 89,
    views: 5600,
    time: "2 д назад",
    isPinned: false,
    isHot: false,
  },
];

const USERS = [
  { id: 1, name: "Артём_Про", avatar: "А", color: "#a855f7", posts: 284, rep: 1240, status: "активен", isBlocked: false },
  { id: 2, name: "Лена_Дизайн", avatar: "Л", color: "#ec4899", posts: 156, rep: 890, status: "активен", isBlocked: false },
  { id: 3, name: "СпамБот2000", avatar: "С", color: "#ef4444", posts: 3, rep: -50, status: "подозрительный", isBlocked: false },
  { id: 4, name: "Макс_Код", avatar: "М", color: "#3b82f6", posts: 98, rep: 560, status: "активен", isBlocked: false },
  { id: 5, name: "Даша_StartUp", avatar: "Д", color: "#00ff88", posts: 342, rep: 2100, status: "активен", isBlocked: false },
  { id: 6, name: "ТролльМод", avatar: "Т", color: "#f59e0b", posts: 12, rep: -120, status: "нарушитель", isBlocked: true },
];

const RULES = [
  {
    num: "01",
    title: "Уважение к участникам",
    desc: "Запрещены оскорбления, дискриминация и агрессия в любой форме. Относитесь к другим так, как хотите, чтобы относились к вам.",
    icon: "Heart",
    color: "#ec4899",
  },
  {
    num: "02",
    title: "Актуальный контент",
    desc: "Публикуйте материалы по теме раздела. Спам, реклама без согласования с администрацией и офтопик удаляются.",
    icon: "Target",
    color: "#a855f7",
  },
  {
    num: "03",
    title: "Достоверность информации",
    desc: "Проверяйте источники перед публикацией. Фейки и намеренная дезинформация — причина бана без предупреждения.",
    icon: "ShieldCheck",
    color: "#3b82f6",
  },
  {
    num: "04",
    title: "Авторские права",
    desc: "При использовании чужих материалов указывайте источник. Плагиат и копипаст без ссылки запрещены.",
    icon: "Copyright",
    color: "#00ff88",
  },
  {
    num: "05",
    title: "Конфиденциальность",
    desc: "Не публикуйте личные данные других пользователей без их согласия. Это касается фото, адресов, контактов.",
    icon: "Lock",
    color: "#f59e0b",
  },
  {
    num: "06",
    title: "Система предупреждений",
    desc: "1 предупреждение — устное замечание. 2 — ограничение на 7 дней. 3 — перманентный бан. Апелляции через поддержку.",
    icon: "AlertTriangle",
    color: "#ef4444",
  },
];

const STAT_CARDS = [
  { label: "Участников", value: "12 847", icon: "Users", color: "#a855f7" },
  { label: "Постов сегодня", value: "384", icon: "FileText", color: "#00ff88" },
  { label: "Онлайн сейчас", value: "1 203", icon: "Wifi", color: "#3b82f6" },
  { label: "Тем всего", value: "47 290", icon: "MessageSquare", color: "#ec4899" },
];

function NavBar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
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
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                page === item.id ? "text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
              style={page === item.id ? { background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.2))", color: "#a855f7" } : {}}
            >
              <Icon name={item.icon} size={15} />
              {item.label}
            </button>
          ))}
        </nav>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
          <Icon name="Plus" size={15} />
          Создать тему
        </button>
      </div>

      <div className="md:hidden flex border-t border-white/5">
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-all ${page === item.id ? "text-purple-400" : "text-white/40"}`}
          >
            <Icon name={item.icon} size={18} />
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}

function HomePage() {
  const [activeCategory, setActiveCategory] = useState("Все");
  const categories = ["Все", "Технологии", "Дизайн", "Программирование", "Бизнес"];

  return (
    <div className="animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl mb-8 p-8 grid-bg" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(59,130,246,0.08))" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88", border: "1px solid rgba(0,255,136,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            1 203 участника онлайн
          </div>
          <h1 className="font-oswald text-4xl md:text-5xl font-bold text-white mb-3 tracking-wide">
            ДОБРО ПОЖАЛОВАТЬ<br />
            <span className="neon-text-purple">В СООБЩЕСТВО</span>
          </h1>
          <p className="text-white/60 text-lg max-w-lg">Место, где идеи становятся обсуждениями, а незнакомцы — единомышленниками.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((s, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                <Icon name={s.icon} size={16} style={{ color: s.color }} />
              </div>
              <span className="text-white/50 text-xs">{s.label}</span>
            </div>
            <div className="font-oswald text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === cat ? "text-white" : "text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/8"
            }`}
            style={activeCategory === cat ? { background: "linear-gradient(135deg, #a855f7, #3b82f6)" } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {POSTS.filter((p) => activeCategory === "Все" || p.category === activeCategory).map((post, i) => (
          <div
            key={post.id}
            className="glass-card rounded-xl p-5 cursor-pointer hover:bg-white/6 transition-all duration-200 animate-slide-up group"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: `${post.color}30`, border: `1px solid ${post.color}40` }}>
                {post.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {post.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>
                      <Icon name="Pin" size={10} /> Закреплено
                    </span>
                  )}
                  {post.isHot && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                      🔥 Горячее
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>{post.category}</span>
                </div>
                <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors mb-1 text-base">{post.title}</h3>
                <p className="text-white/40 text-sm line-clamp-1">{post.preview}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-white/35">
                  <span className="font-medium" style={{ color: post.color }}>{post.author}</span>
                  <span>{post.time}</span>
                  <div className="flex items-center gap-1"><Icon name="Heart" size={12} />{post.likes}</div>
                  <div className="flex items-center gap-1"><Icon name="MessageSquare" size={12} />{post.comments}</div>
                  <div className="flex items-center gap-1"><Icon name="Eye" size={12} />{post.views}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  const userActivities = [
    { type: "post", text: 'Создал тему "Как ИИ меняет разработку в 2026 году"', time: "2 часа назад", icon: "FileText", color: "#a855f7" },
    { type: "comment", text: 'Прокомментировал "Glassmorphism vs Neumorphism"', time: "5 часов назад", icon: "MessageSquare", color: "#3b82f6" },
    { type: "like", text: "Отметил 8 постов", time: "Вчера", icon: "Heart", color: "#ec4899" },
    { type: "post", text: 'Создал тему "React 19 — всё что нужно знать"', time: "3 дня назад", icon: "FileText", color: "#a855f7" },
    { type: "badge", text: 'Получил значок "Эксперт сообщества"', time: "5 дней назад", icon: "Award", color: "#00ff88" },
    { type: "comment", text: 'Прокомментировал "Запустила MVP за 3 дня"', time: "1 неделю назад", icon: "MessageSquare", color: "#3b82f6" },
  ];

  const badges = [
    { name: "Эксперт", icon: "Award", color: "#00ff88" },
    { name: "Топ-автор", icon: "Star", color: "#f59e0b" },
    { name: "Первопроходец", icon: "Compass", color: "#a855f7" },
    { name: "Помощник", icon: "HandHeart", color: "#ec4899" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="glass-card rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), transparent 60%)" }} />
        <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl font-oswald" style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)" }}>
              А
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center" style={{ background: "#00ff88" }}>
              <div className="w-2 h-2 rounded-full bg-black" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-oswald text-2xl font-bold text-white">Артём_Про</h2>
              <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: "rgba(168,85,247,0.2)", color: "#a855f7" }}>МОДЕРАТОР</span>
            </div>
            <p className="text-white/50 text-sm mb-3">Участник с марта 2024 · Москва</p>
            <p className="text-white/70 text-sm max-w-md">Разработчик, люблю делиться знаниями об ИИ и современных технологиях. Пишу понятно о сложном.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Постов", val: "284" },
              { label: "Репутация", val: "1 240" },
              { label: "Подписчики", val: "892" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-oswald text-xl font-bold text-white">{s.val}</div>
                <div className="text-xs text-white/40">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h3 className="font-oswald text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="Activity" size={18} className="text-purple-400" />
            ПОСЛЕДНЯЯ АКТИВНОСТЬ
          </h3>
          <div className="space-y-3">
            {userActivities.map((act, i) => (
              <div key={i} className="glass-card rounded-xl p-4 flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${act.color}20` }}>
                  <Icon name={act.icon} size={15} style={{ color: act.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm">{act.text}</p>
                  <p className="text-white/35 text-xs mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-oswald text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Icon name="Award" size={18} className="text-yellow-400" />
              ДОСТИЖЕНИЯ
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((b, i) => (
                <div key={i} className="glass-card rounded-xl p-3 flex flex-col items-center gap-2 text-center gradient-border animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${b.color}20` }}>
                    <Icon name={b.icon} size={20} style={{ color: b.color }} />
                  </div>
                  <span className="text-xs text-white/60">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <h4 className="font-semibold text-white/80 text-sm mb-3">Активность за месяц</h4>
            <div className="space-y-2">
              {[
                { label: "Посты", val: 24, max: 30, color: "#a855f7" },
                { label: "Комментарии", val: 87, max: 100, color: "#3b82f6" },
                { label: "Лайки", val: 156, max: 200, color: "#ec4899" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>{item.label}</span>
                    <span style={{ color: item.color }}>{item.val}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(item.val / item.max) * 100}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RulesPage() {
  const [openRule, setOpenRule] = useState<number | null>(null);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.2)" }}>
          <Icon name="BookOpen" size={12} />
          Обновлено 10 апреля 2026
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
                <span className="text-lg">{item.emoji}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {RULES.map((rule, i) => (
          <div
            key={i}
            className="glass-card rounded-xl overflow-hidden cursor-pointer animate-slide-up"
            style={{ animationDelay: `${i * 0.06}s` }}
            onClick={() => setOpenRule(openRule === i ? null : i)}
          >
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

function ModerationPage() {
  const [users, setUsers] = useState(USERS);
  const [posts, setPosts] = useState(POSTS);
  const [deletedCount, setDeletedCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
  const [notification, setNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const deletePost = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeletedCount((prev) => prev + 1);
    notify("Пост удалён");
  };

  const toggleBlock = (id: number) => {
    const user = users.find((u) => u.id === id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isBlocked: !u.isBlocked } : u)));
    notify(user?.isBlocked ? `${user.name} разблокирован` : `${user?.name} заблокирован`);
  };

  return (
    <div className="animate-fade-in">
      {notification && (
        <div className="fixed top-20 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium animate-slide-up" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.9), rgba(59,130,246,0.9))", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={16} />
            {notification}
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
          <Icon name="Shield" size={12} />
          Панель модератора
        </div>
        <h1 className="font-oswald text-4xl font-bold text-white mb-3">СИСТЕМА МОДЕРАЦИИ</h1>
        <p className="text-white/50">Управляйте контентом и участниками сообщества.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Жалоб сегодня", val: "7", color: "#ef4444", icon: "Flag" },
          { label: "Удалено постов", val: deletedCount.toString(), color: "#f59e0b", icon: "Trash2" },
          { label: "Заблокировано", val: users.filter((u) => u.isBlocked).length.toString(), color: "#a855f7", icon: "UserX" },
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
        {[
          { id: "posts" as const, label: "Посты", icon: "FileText" },
          { id: "users" as const, label: "Пользователи", icon: "Users" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white/70"}`}
            style={activeTab === tab.id ? { background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(59,130,246,0.2))" } : {}}
          >
            <Icon name={tab.icon} size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "posts" && (
        <div className="space-y-3">
          {posts.length === 0 && (
            <div className="text-center py-12 text-white/30">
              <Icon name="CheckCircle" size={40} className="mx-auto mb-3 opacity-30" />
              <p>Все посты обработаны</p>
            </div>
          )}
          {posts.map((post, i) => (
            <div key={post.id} className="glass-card rounded-xl p-4 flex items-start gap-4 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: `${post.color}30` }}>
                {post.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-white text-sm">{post.title}</h4>
                    <p className="text-white/40 text-xs mt-0.5">{post.author} · {post.time}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => deletePost(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      <Icon name="Trash2" size={12} />
                      Удалить
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <Icon name="Pin" size={12} />
                      Закрепить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-3">
          {users.map((user, i) => (
            <div
              key={user.id}
              className={`glass-card rounded-xl p-4 flex items-center gap-4 animate-slide-up transition-all ${user.isBlocked ? "opacity-50" : ""}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: `${user.color}30`, border: `1px solid ${user.color}30` }}>
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-white text-sm">{user.name}</span>
                  {user.isBlocked && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>Заблокирован</span>}
                  {user.status === "подозрительный" && !user.isBlocked && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>⚠️ Подозрительный</span>}
                  {user.status === "нарушитель" && !user.isBlocked && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>🚫 Нарушитель</span>}
                </div>
                <p className="text-white/40 text-xs">
                  {user.posts} постов · Репутация:{" "}
                  <span style={{ color: user.rep >= 0 ? "#00ff88" : "#ef4444" }}>{user.rep > 0 ? "+" : ""}{user.rep}</span>
                </p>
              </div>
              <button
                onClick={() => toggleBlock(user.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                style={
                  user.isBlocked
                    ? { background: "rgba(0,255,136,0.15)", color: "#00ff88", border: "1px solid rgba(0,255,136,0.2)" }
                    : { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }
                }
              >
                <Icon name={user.isBlocked ? "UserCheck" : "UserX"} size={12} />
                {user.isBlocked ? "Разблокировать" : "Заблокировать"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage />;
      case "profile": return <ProfilePage />;
      case "rules": return <RulesPage />;
      case "moderation": return <ModerationPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <NavBar page={page} setPage={setPage} />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        {renderPage()}
      </main>
    </div>
  );
}
