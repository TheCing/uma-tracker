# UmaTracker 🏇

A Preact + Vite web application for tracking test race results from **Uma Musume Pretty Derby**. Upload your race result screenshots, and the app uses Google's Gemini AI to automatically extract and record your performance data.

## Features

- **Screenshot OCR Analysis** — Upload race result screenshots for instant data extraction via Gemini 2.0 Flash
- **Race Condition Tracking** — Results automatically grouped by race conditions (name, distance, surface, etc.)
- **Character Performance** — Individual statistics for each uma across all races
- **Statistics Dashboard** — Track win rate, podium finishes, and position distribution
- **Data Export/Import** — Backup and restore your race data as JSON files

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Get a Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key

### 4. Configure the App

1. Click the **Settings** tab (⚙️)
2. Paste your API key in the "Google AI API Key" field
3. Click **Save API Key**

## Build for Production

```bash
npm run build
```

The production build will be output to the `dist` folder.

## Deploy to Cloudflare Pages

### Option 1: Git Integration (Recommended)

1. Push your code to a GitHub or GitLab repository
2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/?to=/:account/pages)
3. Click **Create a project** → **Connect to Git**
4. Select your repository
5. Configure build settings:
   - **Framework preset**: None (or Vite)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Click **Save and Deploy**

### Option 2: Direct Upload

1. Build the project locally:
   ```bash
   npm run build
   ```
2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/?to=/:account/pages)
3. Click **Create a project** → **Direct Upload**
4. Upload the `dist` folder
5. Deploy!

### Option 3: Wrangler CLI

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```
2. Login to Cloudflare:
   ```bash
   wrangler login
   ```
3. Build and deploy:
   ```bash
   npm run build
   wrangler pages deploy dist --project-name=uma-tracker
   ```

## Project Structure

```
├── public/
│   ├── _headers        # Cloudflare Pages headers
│   └── _redirects      # SPA routing for Cloudflare Pages
├── src/
│   ├── components/
│   │   ├── Background.jsx
│   │   ├── Navigation.jsx
│   │   ├── ResultsView.jsx
│   │   ├── SettingsView.jsx
│   │   ├── Toast.jsx
│   │   └── UploadView.jsx
│   ├── hooks/
│   │   ├── useRaces.js
│   │   ├── useSettings.js
│   │   └── useToast.js
│   ├── styles/
│   │   └── global.css
│   ├── utils/
│   │   └── gemini.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Data Privacy

- All race data is stored locally in your browser (localStorage)
- Your API key is stored in localStorage (only sent to Google's API)
- No analytics or tracking — completely private
- Cloudflare Pages serves static files only — no server-side processing

## License

MIT License — feel free to modify and share!

---

*Made with 💖 for Uma Musume trainers everywhere*
