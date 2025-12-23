# Brand AI Landing - Architecture & Setup

## Overview
This is a modern React-based AI Landing page and Dashboard with an Admin interface.
Key features:
- **AI Chat:** Supports OpenAI, Anthropic, Google (Gemini) models.
- **Tools:** Real-time Web Search (Google), Image Generation (Google/Imagen), Code Execution (Client-side), and Long-Term Memory.
- **Architecture:** Client-side first, but supports persistent database syncing via Supabase.

## Chat Architecture (Updated)

The Chat system is designed for stability, scalability, and performance.

### 1. Data Model
Messages are stored in a standard JSON structure within the `chats` table (column `messages`):
```json
{
  "id": "timestamp_id",
  "role": "user" | "assistant",
  "content": "Message text...",
  "createdAt": "ISOString",
  "metadata": {},
  "tokens": 0
}
```

### 2. Service Layer (`src/lib/chatService.js`)
- Handles API interactions (Vertex/Gemini).
- Processes System Prompts and Tool Execution (Memory, Code).
- Designed to support Streaming (via callback).

### 3. Hook (`src/hooks/useChat.js`)
- **Optimistic UI:** Messages appear instantly before the API responds.
- **Double-Submit Protection:** Prevents duplicate requests while typing.
- **Cancellation:** Supports aborting requests.
- **Error Handling:** Graceful fallbacks and retry capability (ready).

### 4. Persistence
- **Supabase Adapter:** Maps application state to the `chats` table.
- **Synchronization:** Chat history is loaded on mount and synced after every message.

---

## Database Setup

By default, the application runs in **Local Mode** using your browser's `localStorage`. This is perfect for testing and single-user demos.

To sync data across devices or persist it reliably, you can connect a **Supabase** database.

### Steps to Connect Supabase:

1.  **Create a Project:** Go to [Supabase.com](https://supabase.com) and create a free project.
2.  **Get Credentials:**
    - Go to Project Settings -> API.
    - Copy the `Project URL` and `anon public` Key.
3.  **Configure Admin:**
    - Log in to your app as Admin (`gmotiaaa@gmail.com` / `2099121`).
    - Go to `/admin`.
    - Find the "Database Connection" section.
    - Paste your URL and Key.
4.  **Setup Schema:**
    - In Supabase, go to the **SQL Editor**.
    - Copy the SQL code provided in the Admin Dashboard (or below).
    - Run the query to create tables (`app_users`, `app_settings`, `chats`).

### SQL Schema

```sql
-- Users Table
create table if not exists app_users (
  id text primary key,
  email text not null unique,
  password text not null,
  name text,
  role text default 'user',
  created_at timestamptz default now()
);

-- Settings Table (Keys, Prompts)
create table if not exists app_settings (
  key text primary key,
  value text
);

-- Chats Table
create table if not exists chats (
  id text primary key,
  user_id text not null,
  title text,
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Security Policies (Open for Demo)
alter table app_users enable row level security;
alter table app_settings enable row level security;
alter table chats enable row level security;

create policy "Public Users" on app_users for all using (true);
create policy "Public Settings" on app_settings for all using (true);
create policy "Public Chats" on chats for all using (true);
```

## Running Locally

1.  `npm install`
2.  `npm run dev`
3.  Open `http://localhost:5173`

## Admin Access
- **Email:** `gmotiaaa@gmail.com`
- **Password:** `2099121`
