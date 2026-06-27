# MobileCloud

A full cloud platform control panel Android app — built with pure React Native + Expo components, bundled via GitHub Actions + Gradle.

---

## Features

- Server management (create, start, stop, delete)
- Real-time monitoring & live logs via Supabase Realtime
- Deployment from GitHub repos
- Domain & SSL management
- Encrypted credential vault (S3, SMTP, AI, Stripe, Twilio)
- Background service — keeps running when screen is off
- Auto-restart on phone reboot

---

## Stack

| Layer | Tool |
|---|---|
| UI | React Native (bare) + Expo components |
| Backend | Supabase (DB, Auth, Storage, Realtime) |
| Edge | Cloudflare (DNS, SSL, CDN) |
| CI/CD | GitHub Actions + Gradle |
| Background | Android Foreground Service |

---

## Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **SQL Editor** and paste the full contents of `supabase_schema.sql`
3. Click **Run**
4. Go to **Settings → API** and copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `anon public` key → this is your `SUPABASE_ANON_KEY`

---

## Step 2 — GitHub Setup

1. Create a new GitHub repository (e.g. `MobileCloud`)
2. Go to **Settings → Secrets and variables → Actions**
3. Add these secrets:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_ANON_KEY` — your Supabase anon key

---

## Step 3 — Push from Termux

1. Open Termux on your Android phone
2. Copy the project folder to Termux storage
3. Run:

```bash
cd MobileCloud
chmod +x termux_setup.sh
./termux_setup.sh
```

This will:
- Install Git and Node
- Set up SSH key for GitHub
- Push your code
- Trigger GitHub Actions to build the APK

---

## Step 4 — Download Your APK

1. Go to your GitHub repo
2. Click **Actions** tab
3. Wait for the build to complete (~10-15 minutes)
4. Click the build → Download the APK artifact
5. Or check **Releases** for the latest APK

---

## Step 5 — Configure the App

When you first open the app:
1. Create an account (connects to your Supabase project)
2. Go to **Credentials** → connect your services:
   - S3 storage (Cloudflare R2 / Backblaze B2)
   - Email provider (SMTP / Resend)
   - AI provider (OpenAI / Gemini)
3. Create your first server
4. Deploy from a GitHub repo

---

## Environment Variables

The app reads from environment at build time. Set these in GitHub Secrets:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Project Structure

```
MobileCloud/
├── src/
│   ├── App.tsx              # Navigation root
│   ├── screens/             # All screens
│   ├── components/          # Reusable UI
│   ├── services/            # Supabase + API calls
│   ├── store/               # Zustand state
│   └── utils/               # Theme, encryption
├── android/                 # Native Android files
│   └── app/src/main/java/
│       └── com/mobilecloud/
│           ├── MainActivity.kt
│           ├── MainApplication.kt
│           ├── CloudBackgroundService.kt  ← keeps app alive
│           └── BootReceiver.kt            ← restarts on reboot
├── .github/workflows/
│   └── build.yml            # GitHub Actions APK build
├── supabase_schema.sql      # Run in Supabase SQL editor
└── termux_setup.sh          # Push from Termux
```
