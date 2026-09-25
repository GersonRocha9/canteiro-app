# Canteiro

**Tool and equipment management for construction sites, built with React Native, Expo and Supabase.**

[![Expo](https://img.shields.io/badge/Expo-SDK%2053-000020.svg?logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.79-61DAFB.svg?logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

On a Brazilian construction site (*canteiro de obras*), drills, saws and other equipment move between workers, storage and repair shops every day, and they often get lost along the way. Canteiro gives the site team a shared inventory: what the company owns, where each item is, who has it, and whether it is available, in use or under maintenance.

The UI is in Brazilian Portuguese, and the domain follows local conventions: users sign up with a **CPF** (the Brazilian taxpayer ID, validated by its check digits) and a role that matches how a Brazilian site is staffed (foreman, site manager, storekeeper, worker).

## Features

- **Authentication**: email/password sign-in and sign-up through Supabase Auth. The sign-up form validates the CPF and asks for a role and a company code, which links the user to their construction company.
- **Dashboard**: tool counts by status (total, available, in use, under maintenance). Each card opens the tool list with that filter applied. The dashboard also shows quick actions and the latest movements.
- **Tool inventory**: a list with text search and status filter chips that show a count for each status, pull-to-refresh, loading skeletons and empty states.
- **Add tool**: a form validated with Zod (name, description, serial number, brand, model, location, category, notes).
- **Tool details**: full item data, the assigned user and maintenance history. Actions let you lend, return or send the tool to maintenance, and each one updates its status and assignee.
- **Activity feed**: the movement history (loans, returns, maintenance, transfers), with search and filters by action type.
- **Profile**: user and company data, per-user stats, and sign-out.
- **Multi-tenant data**: every company sees only its own tools, categories and movements. This is enforced by Postgres Row Level Security, not by the client.
- Light and dark themes, including separate app icons and splash screens.

## Tech stack

| Layer | Tools |
| --- | --- |
| App | Expo SDK 53 (dev client, New Architecture enabled), React Native 0.79, React 19, TypeScript |
| Navigation | Expo Router 5 (file-based, typed routes) |
| UI | NativeWind 4 (Tailwind CSS), `@rn-primitives` components, class-variance-authority, Expo Image |
| Forms | React Hook Form + Zod |
| Backend | Supabase (Postgres, Auth, RLS) via `@supabase/supabase-js` |
| Tooling | ESLint (expo config) + Prettier |

## Architecture highlights

- **Route groups for auth**: public screens (`welcome`, `sign-in`, `sign-up`) live at the root of `app/`, and everything behind login sits in the `(protected)` group, with a tab navigator nested in `(tabs)`. The session state comes from a single `SupabaseProvider` context.
- **Encrypted session storage**: Supabase sessions are larger than the SecureStore value limit. So `config/supabase.ts` encrypts the session with AES-256 (CTR mode), stores the ciphertext in AsyncStorage and keeps only the random key in `expo-secure-store`. Token auto-refresh is paused and resumed as the app moves between background and foreground.
- **Data hooks per domain**: `useTools`, `useDashboard`, `useActivities` and `useProfile` wrap the Supabase queries (including relational selects such as a tool with its category and assigned user) and expose loading and error state to the screens.
- **Typed database**: `types/database.types.ts` types the Supabase client, so queries and inserts are checked against the schema.
- **Database-side logic**: `canteiro_setup_completo.sql` is a single, idempotent Supabase setup script. It includes:
  - tables for companies, profiles, tools, categories, tool movements, maintenance records and notifications, with Postgres enums for roles, statuses and actions
  - indexes and `updated_at` triggers
  - company-scoped RLS policies
  - an `on_auth_user_created` trigger that creates the user profile from the sign-up metadata and resolves the company from its code

## Getting started

### Prerequisites

- Node.js and Yarn
- A [Supabase](https://supabase.com) project
- Xcode and/or Android Studio. The project uses `expo-dev-client`, so `ios` and `android` build a native app.

### 1. Install

```bash
git clone https://github.com/GersonRocha9/canteiro-app.git
cd canteiro-app
yarn install
```

### 2. Configure environment

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values are under **Project Settings > API** in the Supabase dashboard.

### 3. Set up the database

Open the Supabase **SQL Editor**, paste the contents of [`canteiro_setup_completo.sql`](canteiro_setup_completo.sql) and run it. The script creates the schema, policies and triggers. It also seeds two sample companies with the codes `ABC001` and `XYZ002`; use one of these codes when you sign up.

### 4. Run

```bash
yarn ios        # build and run on the iOS simulator
yarn android    # build and run on an Android emulator/device
yarn start      # start Metro for an already installed dev build
```

Other scripts:

```bash
yarn lint             # ESLint with --fix
yarn generate-colors  # regenerate constants/colors.ts from global.css
```

## Project structure

```
app/
  welcome.tsx, sign-in.tsx, sign-up.tsx   public screens
  (protected)/
    (tabs)/          dashboard, tools, profile
    add-tool.tsx     new tool form
    tool-details.tsx tool data, actions, maintenance history
    activities.tsx   movement history
components/ui/       reusable UI primitives
config/supabase.ts   Supabase client + encrypted session storage
context/             auth/session provider
hooks/               data hooks per domain
types/               typed Supabase schema
canteiro_setup_completo.sql   full Supabase setup script
```

## License

[MIT](LICENSE)

## Author

**Gerson Rocha**, mobile engineer (React Native / Expo): [github.com/GersonRocha9](https://github.com/GersonRocha9)
