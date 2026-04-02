const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve index.html and other static files

// Database file for persistence
const DB_FILE = path.join(__dirname, 'postcards.json');

// Load postcards from file
function loadPostcards() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error loading postcards:', err);
    }
    return {};
}

// Save postcards to file
function savePostcards(postcards) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(postcards, null, 2));
    } catch (err) {
        console.error('Error saving postcards:', err);
    }
}

// In-memory store (persisted to file)
let postcards = loadPostcards();
let idCounter = Object.keys(postcards).length;

// API: Create a new postcard
app.post('/api/postcards', (req, res) => {
    const { text, to, from, date } = req.body;

    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Message is required' });
    }

    const id = generateShortId();
    const postcard = {
        id,
        text: text,
        to: to || 'My Dear Friend',
        from: from || 'A Typewriter',
        date: date || new Date().toLocaleDateString(),
        created: new Date().toISOString()
    };

    postcards[id] = postcard;
    savePostcards(postcards);

    // Return the full URL (adjust based on your deployment)
    const baseUrl = req.protocol + '://' + req.get('host');
    const shareUrl = `${baseUrl}/p/${id}`;

    res.json({
        success: true,
        id,
        url: shareUrl,
        postcard
    });
});

// API: Get all postcards
app.get('/api/postcards', (req, res) => {
    const postcardList = Object.values(postcards).sort((a, b) => {
        return new Date(b.created) - new Date(a.created);
    });
    res.json(postcardList);
});

// API: Get a postcard by ID
app.get('/api/postcards/:id', (req, res) => {
    const postcard = postcards[req.params.id];
    if (!postcard) {
        return res.status(404).json({ error: 'Postcard not found' });
    }
    res.json(postcard);
});

// Serve postcard page with data embedded
app.get('/p/:id', (req, res) => {
    const postcard = postcards[req.params.id];
    if (!postcard) {
        return res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Postcard Not Found</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #ffc2d1; }
                    h1 { color: #ff6b9d; }
                </style>
            </head>
            <body>
                <h1>Postcard Not Found</h1>
                <p>The postcard you're looking for doesn't exist or has been removed.</p>
            </body>
            </html>
        `);
    }

    // Read the index.html file
    const indexPath = path.join(__dirname, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    // Inject postcard data as JSON in the page
    const postcardScript = `
        <script>
            window.INITIAL_POSTCARD = ${JSON.stringify(postcard)};
        </script>
    `;

    // Insert the script before the closing head tag
    html = html.replace('</head>', postcardScript + '</head>');

    res.send(html);
});

// Generate a short alphanumeric ID (6 characters)
function generateShortId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure uniqueness
    if (postcards[id]) {
        return generateShortId();
    }
    return id;
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
    const interfaces = require('os').networkInterfaces();
    console.log(`\n🌸 Typewriter Postcard Server running at http://localhost:${PORT}`);
    console.log(`📱 Accessible from network:`);
    Object.keys(interfaces).forEach(name => {
        interfaces[name].forEach(iface => {
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(`   http://${iface.address}:${PORT}`);
            }
        });
    });
    console.log(`\n`);
});
