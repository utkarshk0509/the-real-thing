# The Real Thing

A single-page web application for publishing, reading, and interacting with literary works (poems and stories). Built with React, Vite, Tailwind CSS, Framer Motion, and Supabase.

## Architecture & System Design

The application follows a client-heavy architecture with real-time state synchronization via Supabase PostgreSQL subscriptions and local persistence fallbacks.

### Tech Stack
- **Frontend Framework**: React 19 with React Router v7 (`react-router-dom`)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4
- **State Management & Animation**: Framer Motion
- **Icons**: Lucide React
- **Backend & Persistence**: Supabase (PostgreSQL, Supabase Auth, Storage, Realtime WebSockets)
- **Image Optimization**: Client-side Canvas WebP Compression

---

## Project Structure

```
the-real-thing/
├── public/
├── src/
│   ├── assets/              # Static media assets
│   ├── components/          # Reusable UI components
│   │   ├── About/           # Sanctuary about section components
│   │   ├── Engagement/      # Likes, comments, reactions
│   │   ├── Hub/             # Bookshelf and grid components
│   │   └── Shared/          # Backgrounds, navigation, audio player, modal
│   ├── config/              # Constants and layout configuration
│   ├── hooks/               # Custom React hooks (useAuth, useReader, useWorks, useComments)
│   ├── lib/                 # Supabase client initialization
│   ├── pages/               # Top-level view routes (Landing, HomeConstellation, Hub, ReaderView, AuthorPortal)
│   ├── services/            # API abstraction layer (workService, siteService, readerProgressService, etc.)
│   ├── styles/              # Global CSS & Tailwind configuration
│   └── utils/               # Helper utilities (imageCompressor)
├── .env.example             # Template for required environment variables
├── README.md                # Project documentation
├── supabase_schema.sql      # Database initialization script
└── vite.config.js           # Vite build settings
```

---

## Technical Features

### 1. Interactive SVG Constellation Engine
- Coordinate grid rendered inside an SVG canvas (`viewBox="0 0 600 360"`).
- Mouse movement mapped to motion values (`useMotionValue`, `useSpring`) to produce mouse parallax.
- Nodes calculate interactive state on hover, triggering stroke dashoffset animation along SVG edge paths.

### 2. Live Reader State & Real-Time Sync
- **Optimistic State Updates**: Like counts update instantaneously in UI and send atomic SQL RPC calls (`increment_work_likes`) to Supabase.
- **WebSocket Subscriptions**: Listens to Supabase `postgres_changes` on the `works` table. On change, local state updates in-place without triggering skeleton loading screens.
- **Scroll High-Water Mark Tracking**: Monitors `window.scrollY` against `document.documentElement.scrollHeight`. Highest percentage achieved per work slug is saved to `localStorage` and mapped to progress badges.

### 3. Client-Side Image Compression & Alignment Tool
- Canvas-based image compressor converts uploaded raster images (JPEG/PNG) to WebP format before uploading to Supabase Storage.
- Dual-mode image positioning allows independent setting of crop scale, X offset, and Y offset for both Grid view and 3D Bookshelf view.

### 4. Reading Customizer & Browser Selection API
- Theme state (`midnight`, `sepia`, `nebula`) dynamically toggles CSS container background classes and background nebula canvas palettes.
- Quote extraction captures user selections via `window.getSelection()` within a 10–300 character constraint and computes absolute screen coordinates for contextual tooltips.

---

## Database Schema & Configuration

The application requires PostgreSQL tables on Supabase. Execute `supabase_schema.sql` in the Supabase SQL Editor to set up:

- `works`: Core content table containing title, slug, body, author, category (`poem` | `story`), like counts, image URLs, crop parameters, and publication status.
- `comments`: Reader comments linked via `work_id`.
- `site_settings`: Global configuration table for author bio, manifesto text, and spotlight selections.
- `reader_whispers`: Messages submitted to the author portal.

### Enabling Realtime Subscriptions
To receive real-time table broadcasts, enable PostgreSQL replication for the `works`, `site_settings`, and `reader_whispers` tables in Supabase:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE works;
ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE reader_whispers;
```

---

## Local Setup & Installation

### 1. Prerequisites
- Node.js v18 or higher
- npm or yarn

### 2. Repository Clone & Dependency Installation
```bash
git clone https://github.com/utkarshk0509/the-real-thing.git
cd the-real-thing
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CURATOR_EMAIL=your-curator-email@example.com
VITE_AUTHOR_PASSCODE=1234
```

### 4. Development Server
Run the local development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## Build & Production Verification

To compile the application for production deployment:

```bash
npm run build
```

To preview the built production bundle locally:

```bash
npm run preview
```

## License

MIT License or Private Project. All content rights reserved by author.