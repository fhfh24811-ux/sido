# إعداد موقع SIDO

## 1. إعداد Supabase

افتح `backend/supabase.js` وضع بياناتك:

```js
const SUPABASE_URL  = "https://xxxx.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

## 2. إنشاء الجداول في Supabase

انسخ هذا الـ SQL وشغله في **SQL Editor** في Supabase:

```sql
-- جدول الملفات الشخصية
create table profiles (
  id uuid references auth.users primary key,
  username text,
  points int default 0,
  created_at timestamptz default now()
);

-- جدول الأنمي
create table animes (
  id bigserial primary key,
  title text,
  description text,
  image_url text,
  type text,        -- 'anime-dubbed' | 'anime-subbed' | 'movies' | 'turkish'
  year text,
  rating text,
  episodes_count int,
  badge text,
  duration text,
  created_at timestamptz default now()
);

-- جدول الحلقات
create table episodes (
  id bigserial primary key,
  anime_id bigint references animes(id),
  episode_number int,
  title text,
  video_url text,
  download_url text,
  created_at timestamptz default now()
);

-- جدول النقاط
create table points_log (
  id bigserial primary key,
  user_id uuid references auth.users,
  amount int,
  type text,   -- 'watch' | 'daily_login' | 'signup_bonus' | 'referral' | 'redeem'
  note text,
  created_at timestamptz default now()
);

-- جدول قائمة المشاهدة
create table watchlist (
  id bigserial primary key,
  user_id uuid references auth.users,
  anime_id bigint references animes(id),
  created_at timestamptz default now(),
  unique(user_id, anime_id)
);

-- جدول الإعلانات (اختياري)
create table ads (
  id bigserial primary key,
  placement text,
  image_url text,
  link_url text,
  active boolean default true,
  created_at timestamptz default now()
);

-- صلاحيات القراءة للعموم
alter table animes enable row level security;
alter table episodes enable row level security;
alter table profiles enable row level security;
alter table points_log enable row level security;
alter table watchlist enable row level security;

create policy "animes public read" on animes for select using (true);
create policy "episodes public read" on episodes for select using (true);
create policy "profiles own read" on profiles for all using (auth.uid() = id);
create policy "points own" on points_log for all using (auth.uid() = user_id);
create policy "watchlist own" on watchlist for all using (auth.uid() = user_id);
```

## 3. هيكل الملفات

```
sido-anime/
├── src/
│   └── index.html          ← الصفحة الرئيسية
├── pages/
│   ├── anime.html          ← صفحة الأنمي
│   ├── episode.html        ← صفحة المشاهدة
│   ├── episodes.html       ← قائمة الحلقات
│   ├── movies.html         ← الأفلام
│   ├── turkish.html        ← المسلسلات التركية
│   ├── watchlist.html      ← قائمتي
│   ├── account.html        ← الحساب الشخصي
│   ├── login.html          ← تسجيل الدخول
│   └── register.html       ← إنشاء حساب
├── js/
│   ├── navbar.js           ← الـ navbar الموحد (يتحمل تلقائياً)
│   ├── points.js           ← نظام النقاط
│   ├── auth.js             ← المصادقة
│   ├── anime.js            ← صفحة الأنمي
│   ├── watch.js            ← صفحة المشاهدة
│   ├── player.js           ← مشغل الفيديو
│   ├── main.js             ← الصفحة الرئيسية
│   ├── login.js            ← تسجيل الدخول
│   ├── register.js         ← إنشاء الحساب
│   └── account.js          ← الحساب
├── backend/
│   ├── supabase.js         ← ⚠️ ضع بياناتك هنا
│   ├── anime_api.js        ← API الأنمي
│   ├── user_api.js         ← API المستخدمين
│   └── ads_api.js          ← API الإعلانات
└── css/
    ├── navbar.css          ← تصميم الـ navbar الموحد
    ├── style.css           ← تصميم الصفحة الرئيسية
    ├── anime.css           ← تصميم صفحة الأنمي
    ├── watch.css           ← تصميم صفحة المشاهدة
    └── login.css           ← تصميم صفحات الدخول
```

## 4. نظام النقاط والمكافآت

| الحدث | النقاط |
|-------|--------|
| تسجيل حساب جديد | +100 نقطة |
| دخول يومي | +50 نقطة |
| مشاهدة حلقة (3 دقائق) | +10 نقاط |
| دعوة صديق | +200 نقطة |
| يوم الجمعة | النقاط x2 |

**نظام البطاقات:**
- 1000 نقطة = بطاقة مكافأة بقيمة 1$
- 40% من قيمة البطاقة تعود للمستخدم
- 60% إيراد للمنصة
