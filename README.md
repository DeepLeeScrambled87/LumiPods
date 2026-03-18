# LumiPods - Homeschool Learning Management Platform

A modern, feature-rich homeschool learning management platform built with React 19, TypeScript, Vite, and Tailwind CSS 4.

## Features

- **Dashboard** - Overview of daily tasks, progress, and quick actions
- **Learning Pods** - Themed learning adventures (STEM, Languages, Year-Round curriculum)
- **Calendar** - Daily schedule with enhanced block details (French vocab, AI skills, resources)
- **Maths Games** - Interactive math practice (Times Tables, Roman Numerals, Conversions)
- **Portfolio** - Student work artifacts and competency tracking
- **Student Profiles** - Individual learner progress and achievements
- **AI Tutor** - Ask Lumi for help with learning
- **Reports** - Generate progress reports
- **PWA Support** - Install as a mobile/desktop app

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **State**: React Context + localStorage
- **Backend**: PocketBase today, Appwrite migration in progress, with localStorage fallback
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Quick Start

```bash
# Install dependencies
npm install

# Start local dev with both Vite and the server-side OpenAI proxy
# Put OPENAI_API_KEY in .env first
npm run dev:openai

# Or run them separately if you prefer
npm run ai-proxy
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Check the local OpenAI path:

```bash
npm run openai:health
```

Expected result:
- `http://localhost:8787/health` returns `200`
- `http://localhost:3002/api/openai/health` returns `200`

If Lumi still answers in demo mode after health is green:
- open `Settings -> AI & Voice`
- set `AI provider` to `OpenAI`
- set `Speech provider` to `OpenAI` if you want OpenAI TTS
- keep `OpenAI proxy URL` as `/api/openai`

AI runtime settings are stored in browser storage, so an older saved `mock` or `ollama` choice will override the `.env` defaults until you change it there.

## Appwrite Migration

Appwrite is now the target production backend. The frontend can still run against PocketBase locally while the migration is in progress.

Runtime backend toggle for the frontend:

```env
VITE_DATA_BACKEND=pocketbase
VITE_POCKETBASE_URL=http://localhost:8090

# Enable when the Appwrite runtime adapter is ready for the environment
VITE_APPWRITE_ENDPOINT=
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=lumipods
VITE_APPWRITE_BUCKET_ID=learner-artifacts
```

Current adapter scope:
- PocketBase remains the default runtime backend
- Appwrite document reads/writes are scaffolded for core collections
- artifact file upload/delete still remains PocketBase-backed until Appwrite storage auth/cutover is wired

Useful commands:

```bash
# Check the Appwrite target and PocketBase source before migrating
npm run appwrite:preflight

# Generate a dry-run migration report without writing any Appwrite documents/files
npm run appwrite:migrate:dry

# Run the actual PocketBase -> Appwrite migration
npm run appwrite:migrate
```

The migration scripts expect these env vars in `.env`:

```env
APPWRITE_ENDPOINT=
APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
APPWRITE_DATABASE_ID=lumipods
APPWRITE_BUCKET_ID=learner-artifacts
APPWRITE_BUCKET_MAX_FILE_SIZE=52428800

POCKETBASE_CONTAINER=lumipods-pocketbase
POCKETBASE_DATA_DB_PATH=/pb_data/data.db
POCKETBASE_STORAGE_ROOT=/pb_data/storage
```

## Deployment

### Environment Variables

Create a `.env` file for production:

```env
# Frontend runtime
VITE_DATA_BACKEND=pocketbase
VITE_POCKETBASE_URL=https://your-pocketbase-instance.com
VITE_APPWRITE_ENDPOINT=
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=lumipods
VITE_APPWRITE_BUCKET_ID=learner-artifacts
VITE_LLM_PROVIDER=openai
VITE_SPEECH_PROVIDER=openai
VITE_OPENAI_PROXY_URL=/api/openai
# Optional local Ollama
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2
```

For production-safe OpenAI usage, keep the real `OPENAI_API_KEY` on the server-side proxy only:

```env
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com

# Appwrite deployment and migration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
APPWRITE_DATABASE_ID=lumipods
APPWRITE_BUCKET_ID=learner-artifacts
APPWRITE_BUCKET_MAX_FILE_SIZE=52428800
```

### Docker Deployment

The project includes Docker support for easy deployment:

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t lumipods .
docker run -p 80:80 lumipods
```

`docker-compose.yml` now includes a companion `lumipods-ai-proxy` service so `/api/openai/*` is handled server-side instead of exposing the OpenAI key in the browser.

### Platform-Specific Deployment

#### Railway
1. Connect your GitHub repository
2. Railway auto-detects the Dockerfile
3. Set environment variables in Railway dashboard
4. Deploy automatically on push

#### DigitalOcean App Platform
1. Create new App from GitHub repo
2. Select "Dockerfile" as build method
3. Configure environment variables
4. Deploy

#### Render
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set start command: `npx serve dist -s`
5. Add environment variables

#### Vercel
1. Import GitHub repository
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy

#### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy

### Static Hosting (Any Provider)

```bash
# Build the project
npm run build

# The `dist` folder contains static files
# Upload to any static hosting (S3, CloudFlare Pages, GitHub Pages, etc.)
```

## Project Structure

```
src/
├── app/                    # App entry, routing, layouts
├── components/             # Shared UI components
│   ├── ui/                 # Base UI components (Button, Card, Modal, etc.)
│   ├── pods/               # Pod-related components
│   └── planner/            # Planner components
├── features/               # Feature modules
│   ├── auth/               # Authentication
│   ├── calendar/           # Calendar & scheduling
│   ├── dashboard/          # Dashboard
│   ├── family/             # Family context & state
│   ├── maths/              # Maths games
│   ├── month-detailed/     # Detailed curriculum view
│   ├── portfolio/          # Portfolio management
│   ├── students/           # Student profiles
│   └── ...
├── data/                   # Static data & curriculum
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities
├── services/               # Business logic & API
└── types/                  # TypeScript types
```

## Development

```bash
# Type check
npm run build

# Lint
npm run lint

# Format (if configured)
npm run format
```

## Key Patterns

- **Feature-based structure**: Each feature has its own folder with page, components, and index
- **Context for state**: FamilyContext manages global state, ThemeContext for dark/light mode
- **Service layer**: Business logic in `src/services/`
- **Lazy loading**: Pages are lazy-loaded for better performance
- **Button variants**: `primary | secondary | ghost | danger`

## License

MIT
