// Pure Node.js Standard Library - No External Frameworks Used (Pillar 3 Compliance)
const http = require('http');

// In-Memory Data Storage (Acting as our temporary Database Layer)
let usersDatabase = [
    { id: 1, name: "Arnav Tripathi", role: "admin" },
    { id: 2, name: "Ayush Sharma", role: "user" }
];

const PORT = 3000;

// The Brain/Server Logic
const server = http.createServer((req, res) => {
    // Set Global Response Headers for JSON and CORS Policy
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS Pre-flight Options Request
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- ENDPOINT 1: GET /users (Retrieve Data) ---
    if (req.url === '/users' && req.method === 'GET') {
        res.writeHead(200); // 2xx Success Tone
        res.end(JSON.stringify({
            status: "success",
            count: usersDatabase.length,
            data: usersDatabase
        }));
    }

    // --- ENDPOINT 2: POST /users (Create Data with Blood-Brain Barrier Validation) ---
    else if (req.url === '/users' && req.method === 'POST') {
        let body = '';

        // Read incoming stream data (IPO Model Processing)
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Syntactic Validation: Checking if JSON structure is valid
                const parsedData = JSON.parse(body);

                // Semantic Validation: Checking if mandatory fields exist and are strings
                if (!parsedData.name || typeof parsedData.name !== 'string' || !parsedData.role || typeof parsedData.role !== 'string') {
                    res.writeHead(400); // 400 Bad Request
                    res.end(JSON.stringify({
                        error: "Bad Request",
                        message: "Malformed Data. 'name' and 'role' are mandatory string fields."
                    }));
                    return;
                }

                // If Validated: Process input and add to storage
                const newUser = {
                    id: usersDatabase.length + 1,
                    name: parsedData.name,
                    role: parsedData.role
                };
                usersDatabase.push(newUser);

                res.writeHead(201); // 201 Created Status
                res.end(JSON.stringify({
                    status: "success",
                    message: "User successfully synthesized into the system.",
                    data: newUser
                }));

            } catch (error) {
                // If JSON parsing fails (Malformed Data)
                res.writeHead(400); // 400 Client Error
                res.end(JSON.stringify({
                    error: "Bad Request",
                    message: "Invalid JSON format payload."
                }));
            }
        });
    } 

    // --- FALLBACK: 404 Route Not Found ---
    else {
        res.writeHead(404); // 404 Not Found Code
        res.end(JSON.stringify({
            error: "Not Found",
            message: "The requested architectural endpoint does not exist."
        }));
    }
});

// Start the Backend Engine
server.listen(PORT, () => {
    console.log(`============= DECODELABS BACKEND INTEGRATION =============`);
    console.log(`Server Brain Stem active and listening on port: ${PORT}`);
    console.log(`Endpoint Available: GET  http://localhost:${PORT}/users`);
    console.log(`Endpoint Available: POST http://localhost:${PORT}/users`);
    console.log(`==========================================================`);
});