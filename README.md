# Typewriter Postcard

A beautiful typewriter interface that lets you write messages and share them as animated postcards.

## Features

- ✨ Vintage typewriter with on-screen keyboard
- 💌 Send messages as animated postcards
- 🔗 Get short, clean share URLs (no message text in URL!)
- 📱 Fully responsive design
- 🎨 Beautiful pink gradient theme with smooth animations

## Quick Start

### Option 1: With Backend Server (Recommended for sharing)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open browser: http://localhost:3000

4. Type your message, click "Send as Postcard", then copy the short URL!

### Option 2: Static HTML Only (Local testing only)

- Just open `index.html` in your browser
- Note: Sharing uses URL hash with the full message text (long URLs)

## How Sharing Works

### With Server:
- Creates a unique short ID: `http://yoursite.com/p/abc123`
- Stores postcard data on the server
- Clean, short URLs!

### Without Server:
- Embeds message in URL hash: `index.html#letter={...}`
- Long URLs containing the full message
- Only works locally or needs manual hosting

## Deployment

### Deploy to Netlify (with backend):

**Important:** Netlify's free tier doesn't support Node.js servers in the same way. You'll need to:

1. Use a separate hosting service for the backend (Heroku, Railway, Render, etc.)
2. Update the frontend API URL in `index.html` to point to your backend server

OR

2. **Split into two functions:**
   - Frontend (static HTML/CSS/JS) → Host on Netlify
   - Backend (Node.js server) → Host elsewhere (Heroku/Railway/Render)

### Deploy Backend to Railway/Render:

```bash
# Push to GitHub, then deploy on Railway/Render
# Set PORT environment variable (they set it automatically)
```

### Deploy Frontend to Netlify:

1. Push only `index.html` to a repository
2. Deploy on Netlify (drag & drop or connect repo)
3. Update the API URL in the frontend:
   - Edit `index.html`
   - Find the `fetch('/api/postcards', ...)` line
   - Change `'/api/postcards'` to `'https://your-backend.com/api/postcards'`

## File Structure

```
DEMO PROJECT 2/
├── index.html      # Frontend (typewriter + postcard UI)
├── server.js       # Express backend server
├── package.json    # Dependencies
├── postcards.json  # Database (auto-created)
└── README.md       # This file
```

## API Endpoints

- `POST /api/postcards` - Create a new postcard
  - Body: `{ text, to, from, date }`
  - Returns: `{ success, id, url, postcard }`

- `GET /api/postcards/:id` - Get a postcard by ID
  - Returns: Postcard data

- `GET /p/:id` - View a postcard page (redirects to index.html with data injected)

## Database

Postcards are stored in `postcards.json` file. This is a simple file-based database.
For production, consider using SQLite, MongoDB, or PostgreSQL.
