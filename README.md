# 🚀 Smart Bookmark App

A simple, private bookmark manager with **Google OAuth login only**, realtime updates, and per-user privacy.

Built with:

- **Next.js 15** (App Router)
- **Supabase** (Google OAuth, Postgres + Row Level Security, Realtime)
- **Tailwind CSS**
- **TypeScript**

---

## ✨ Features

- 🔐 Sign in with Google (no email/password)
- ➕ Add, view, and delete your own bookmarks
- ⚡ Realtime updates across browser tabs/devices
- 🔒 100% private bookmarks using Row Level Security (RLS)
- 🚀 Deployed on Vercel

---

## 🌐 Live Demo

```
https://smart-book-app-six.vercel.app/
```


# 🛠️ Tech Stack

- Next.js 15 (App Router)
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- PostgreSQL
- Tailwind CSS
- TypeScript
- Vercel (Deployment)

---

# 🧠 Problems I Ran Into & How I Solved Them

Here are real issues encountered during development and how they were resolved.

---

## 🔁 1. Google OAuth Redirect Loop

### Problem  
After choosing Google account → redirected back to login instead of dashboard.

### Solution  

1. Created `app/auth/callback/route.ts` using `@supabase/ssr`
2. Set:

```ts
redirectTo: `${location.origin}/auth/callback`
```

3. Added `/auth/callback` to:
   - Supabase Redirect URLs
   - Google Cloud Authorized Redirect URIs

---

## 🍪 2. Next.js 15 `cookies()` is async

### Problem  
```
Property 'get' does not exist on type 'Promise<ReadonlyRequestCookies>'
```

### Solution  

Used:

```ts
const cookieStore = await cookies();
```

Before accessing `.get()` or `.set()` in middleware/server clients.

---

## ⚡ 3. Realtime Not Working Locally

### Problem  
```
WebSocket closed before connection established
Status: CLOSED → TIMED_OUT
```

### Solution  

Downgraded:

```
@supabase/supabase-js → 2.49.7
```

OR forced:

```ts
realtime: { params: { vsn: '1.0.0' } }
```

This was a known local dev issue in newer versions.  
Production worked fine.

---

## ❌ 4. Realtime INSERT Worked, But DELETE Did Not

### Problem  
Delete event didn’t update UI. Had to refresh manually.

### Solution  

Implemented **optimistic delete**:

- Remove from local state immediately
- Perform delete in DB
- Roll back on error if needed

Reason:
Supabase Realtime has limitations with filtered DELETE events when RLS is enabled.

---

## 🔄 5. Multiple Supabase Client Instances

### Problem  
WebSocket connection dropped quickly in development.

### Solution  

Used a **singleton pattern**:

```ts
getBrowserClient()
```

Ensured only one Supabase client instance is created and reused.

---

# ⚡ Quick Start

## 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/smart-bookmark-app.git
cd smart-bookmark-app
```

---

## 2️⃣ Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

---

## 3️⃣ Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Get these from:

**Supabase Dashboard → Settings → API**

---

## 4️⃣ Run locally

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open:

```
http://localhost:3000
```

---

# 🚀 Deployment (Vercel)

1. Push the repo to GitHub
2. Go to https://vercel.com
3. Click **New Project → Import Git Repository**
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

---

## After First Deploy

Update in Supabase:

**Authentication → URL Configuration**

- Site URL:
```
https://your-app-name.vercel.app
```

- Redirect URLs:
```
https://your-app-name.vercel.app/auth/callback
```

---

(Optional)

Update Google Cloud Console OAuth credentials with your deployed URL.

---



# 🗄️ Supabase Setup Notes (Important)

Make sure the following are configured correctly:

---

## ✅ Enable Google OAuth

Supabase → Authentication → Providers → Google → Enable

---

## ✅ Add Authorized Redirect URIs

In both:

- Google Cloud Console
- Supabase Dashboard

---

## ✅ Create `bookmarks` Table

```sql
create table bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  created_at timestamp default now()
);
```

---

## ✅ Enable Row Level Security (RLS)

```sql
alter table bookmarks enable row level security;
```

### Policies

```sql
create policy "Users can view own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);
```

---

## ✅ Enable Realtime

Make sure `bookmarks` table is added to:

```
supabase_realtime publication
```

Or enable it from:

Supabase → Tables → bookmarks → Realtime toggle (green check)

---

# 📌 Final Notes

This project demonstrates:

- Secure authentication with OAuth
- Server + Client integration using Supabase SSR
- Realtime database updates
- Row Level Security for per-user privacy
- Production-ready deployment on Vercel

---

## 👨‍💻 Author

Vinay Rajput,  
Full Stack Developer (MERN + Next.js + Supabase)

---

