// Native Node.js HTTP and SQLite3 Core Library Integration
const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const PORT = 3000;
const dbPath = path.join(__dirname, 'database.db');

// Initialize Permanent SQLite Database Storage Connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection failure:", err.message);
    } else {
        console.log("Connected successfully to permanent SQLite storage layer.");
    }
});

// Structural Schema Initialization (Creating Tables with Primary Keys)
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT NOT NULL
        )
    `, (err) => {
        if (err) console.error("Schema injection failed:", err.message);
        else console.log("Database schema verified: 'users' table is active.");
    });
});

// Main Server Architecture Router
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- ENDPOINT 1: GET /users (READ Operation) ---
    if (req.url === '/users' && req.method === 'GET') {
        db.all("SELECT * FROM users", [], (err, rows) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: "Database Error", message: err.message }));
                return;
            }
            res.writeHead(200);
            res.end(JSON.stringify({ status: "success", count: rows.length, data: rows }));
        });
    }

    // --- ENDPOINT 2: POST /users (CREATE Operation) ---
    else if (req.url === '/users' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const parsedData = JSON.parse(body);
                // "Never Trust the Client" Strict Validation Gate
                if (!parsedData.name || !parsedData.role) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: "Bad Request", message: "'name' and 'role' fields are mandatory." }));
                    return;
                }

                const stmt = db.prepare("INSERT INTO users (name, role) VALUES (?, ?)");
                stmt.run(parsedData.name, parsedData.role, function(err) {
                    if (err) {
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: "Insertion Error", message: err.message }));
                        return;
                    }
                    res.writeHead(201);
                    res.end(JSON.stringify({
                        status: "success",
                        message: "Data permanently committed to storage.",
                        data: { id: this.lastID, name: parsedData.name, role: parsedData.role }
                    }));
                });
                stmt.finalize();
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "Bad Request", message: "Invalid JSON format." }));
            }
        });
    }

    // --- ENDPOINT 3: PUT /users (UPDATE Operation) ---
    else if (req.url.startsWith('/users/') && req.method === 'PUT') {
        const id = req.url.split('/')[2];
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const parsedData = JSON.parse(body);
                if (!parsedData.name || !parsedData.role) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: "Bad Request", message: "Update payload requires both 'name' and 'role'." }));
                    return;
                }

                db.run("UPDATE users SET name = ?, role = ? WHERE id = ?", [parsedData.name, parsedData.role, id], function(err) {
                    if (err) {
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: "Update Error", message: err.message }));
                        return;
                    }
                    if (this.changes === 0) {
                        res.writeHead(404);
                        res.end(JSON.stringify({ error: "Not Found", message: `No user records found matching ID: ${id}` }));
                        return;
                    }
                    res.writeHead(200);
                    res.end(JSON.stringify({ status: "success", message: `Record ${id} successfully updated inside database.` }));
                });
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "Bad Request", message: "Invalid JSON format." }));
            }
        });
    }

    // --- ENDPOINT 4: DELETE /users (DELETE Operation) ---
    else if (req.url.startsWith('/users/') && req.method === 'DELETE') {
        const id = req.url.split('/')[2];
        db.run("DELETE FROM users WHERE id = ?", id, function(err) {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: "Deletion Error", message: err.message }));
                return;
            }
            if (this.changes === 0) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: "Not Found", message: `No user records found matching ID: ${id}` }));
                return;
            }
            res.writeHead(200);
            res.end(JSON.stringify({ status: "success", message: `Record ${id} safely purged from physical storage.` }));
        });
    }

    // --- FALLBACK 404 LAYER ---
    else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Not Found", message: "Endpoint architectural route path missing." }));
    }
});

server.listen(PORT, () => {
    console.log(`============= DECODELABS DATABASE INTEGRATION =============`);
    console.log(`Server Brain active and persistent engine listening on port: ${PORT}`);
    console.log(`Endpoints: GET/POST /users | PUT/DELETE /users/{id}`);
    console.log(`===========================================================`);
});