# FreyaAI: Emotion-Driven Music Experience

FreyaAI is a web application that helps users navigate emotions through personalized music experiences. It uses Spotify's API, NLP-based emotion analysis, facial expression detection, and Suno AI music generation.

## Architecture

Single Next.js 16 server — no Python backend required.

```
FreyaAI/
  app/             # Next.js App Router (pages + API routes)
  src/
    components/    # Shared React components
    hooks/         # React hooks (auth)
    lib/           # Server-side libraries (auth, spotify, emotions, genres, suno, db)
    types/         # TypeScript type definitions
  data/            # Static data (GENRES.md, EMOTIONS.md) + SQLite database
  public/          # Static assets + face-api.js models
```

## Features

- **NLP Emotion Analysis** — Describe how you feel in words, get a curated Spotify playlist
- **Facial Expression Detection** — Browser-side detection using face-api.js (no data leaves your device)
- **AI Music Generation** — Generate custom music with Suno AI
- **Genre Preferences** — Select preferred genres with diversification to prevent filter bubbles
- **30+ Emotion Taxonomy** — Based on Darwin's work on emotional expression

## Setup

```bash
npm install
```

Create `.env.local`:

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8888/callback
SUNO_API_KEY=your_suno_api_key
SESSION_SECRET=your_session_secret_min_32_chars
```

## Development

```bash
npm run dev     # Start development server at http://127.0.0.1:8888
npm run build   # Production build
npm start       # Start production server at http://127.0.0.1:8888
```

## Tech Stack

- **Framework:** Next.js 16 + React 19
- **Styling:** Tailwind CSS 3.4
- **Auth:** Spotify OAuth 2.0 with encrypted JWT sessions (jose)
- **Database:** SQLite via better-sqlite3 + Drizzle ORM
- **Face Detection:** face-api.js (browser-side)
- **TypeScript** throughout
