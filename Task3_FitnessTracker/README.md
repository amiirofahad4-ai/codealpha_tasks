# FitTrack – Fitness Tracker App

A fitness tracking app built with **React Native (Expo)** and **Supabase** for the **CodeAlpha App Development Internship – Task 3**.

Sign in, log your workouts, steps and calories, and see your daily and weekly progress with progress bars and a 7-day chart. Data is stored in a **Supabase (PostgreSQL)** backend, so it is the same on every phone you sign in on.

## 📲 Download (Android)

**[Download FitTrack APK](https://expo.dev/artifacts/eas/a7baA_BebNluVkeYW3fdwOkGbD51Y1t0LfB7zOZDXlg.apk)**: open on an Android phone, allow "Install unknown apps", then install.

## Features

| Requirement (CodeAlpha Task 3) | How the app does it |
|---|---|
| Track daily activities: steps, workouts, calories | Each activity stores type, duration, steps and calories |
| Add / log data manually | "Log activity" form (tap **+**), with edit and delete |
| Dashboard with daily/weekly progress | Dashboard shows today's totals, a 7-day bar chart and weekly summary |
| Simple UI with graphs or progress bars | Progress bars toward daily goals + 7-day chart (steps / calories / active time) |
| Store data locally or with a backend like Firebase | **Supabase** backend (PostgreSQL + Auth) |

Extras:
- **Login and sign up** with email and password (Supabase Auth)
- **Row Level Security**: each user can only see their own data
- **Automatic calorie estimate** from activity type, duration and body weight (MET formula), which you can override
- **Daily goals** you can change (steps, calories, active minutes), saved in the cloud
- **Streak** counter for days in a row with activity
- **History** screen grouped by day, with daily totals
- **Dark mode** (follows the phone's setting)
- **Sample week** button to fill the app with demo data

## Screens

- **Welcome** – brand screen with Get Started and Sign In
- **Sign In / Sign Up** – name, email and password (with show/hide password)
- **Set Your Goal** – name + fitness goal (Lose Weight, Build Muscle, Run a 5K, Improve Endurance), shown once after sign up
- **Home** – greeting, Today's Progress % with a ring, calories / distance / active time, weekly line chart, quick actions, recent activities
- **Workouts** – ready-made workouts by category (All, Cardio, Strength, Yoga); tap one to start it
- **Workout timer** – live time, calories and estimated steps with Start / Pause / Resume / Finish; Finish saves the workout
- **Progress** – totals for 1W / 1M / 3M / 1Y with % change vs the period before, mini bar charts, today's goals
- **Profile** – avatar, lifetime stats, My Goals, Fitness Goal, All Activities, About, Log Out
- **Log activity** – manual entry: type, date, duration, steps, calories and a note (edit and delete too)
- **All activities** – history grouped by day; tap to edit, trash icon to delete
- **My Goals** – daily targets, body weight, sample week (only when empty) and delete-all

## Tech stack

| Part | Tool |
|---|---|
| App | React Native 0.88 + Expo SDK 58 |
| Navigation | Expo Router (bottom tabs) |
| Backend / database | Supabase (PostgreSQL) via `@supabase/supabase-js` |
| Login | Supabase Auth (email + password) |
| Login storage on phone | `@react-native-async-storage/async-storage` |
| Icons | `@expo/vector-icons` |
| Charts and rings | `react-native-svg` |
| Gradients | `expo-linear-gradient` |

## Project structure

```
supabase/
  schema.sql            Tables + Row Level Security rules (run in Supabase)
src/
  app/                  Screens (Expo Router)
    _layout.js          Setup check → welcome / login → set goal → app
    activity.js         Log / edit activity form
    session.js          Workout timer
    history.js          All activities
    goals.js            My Goals and data tools
    focus.js            Change name and fitness goal
    (tabs)/
      _layout.js        Bottom tabs
      index.js          Home
      progress.js       Progress
      workouts.js       Workouts
      profile.js        Profile
  components/           Shared UI (ring, line chart, cards), welcome, login, goal picker
  context/
    AuthContext.js      Who is signed in
    FitnessContext.js   Activities, goals, daily totals, streak
  db/database.js        All Supabase queries
  lib/supabase.js       Supabase client
  constants.js          Activity types, default goals, calorie formula
  theme.js              Light and dark colors
  utils/date.js         Date helpers
```

## Database (Supabase / PostgreSQL)

```
activities: id, user_id, type, duration, calories, steps, date, note, created_at
goals:      user_id, steps, calories, minutes, weight, updated_at
```

The user's name and fitness goal are stored in the Supabase Auth user metadata.

`user_id` links every row to the signed-in user. Row Level Security policies make sure users can only read and change their own rows.

## Setup

### 1. Create the Supabase backend
1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste everything from [`supabase/schema.sql`](supabase/schema.sql) and press **Run**.
3. (Optional, for quick testing) In **Authentication → Sign In / Providers → Email**, turn off **Confirm email** so new accounts can sign in right away.

### 2. Connect the app
1. Create a file called `.env` in the project folder with these two lines:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=your-publishable-key
   ```
2. In Supabase open **Project Settings → API** (or the **Connect** button) and copy the **Project URL** and the **publishable (anon) key** into it.

   Never put the `service_role` / secret key in the app.

### 3. Run it
```bash
npm install
npx expo start --clear
```
Install **Expo Go** on your phone and scan the QR code. Press `w` to open it in the browser.

## Calorie formula

```
calories = MET × body weight (kg) × hours
```

MET values: walking 3.5, running 9.8, cycling 7.5, swimming 8.0, HIIT 8.0, strength 5.0, yoga 2.5, other 4.0.

Distance is estimated from steps (about 0.76 m per step). The workout timer estimates steps at 100 per minute for walking and 160 per minute for running.

---

Made for the CodeAlpha App Development Internship.
