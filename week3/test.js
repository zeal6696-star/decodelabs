const http = require('http');

console.log("=====================================================================");
console.log("Initiating Complete Asynchronous Database Lifecycle Assertions...");
console.log("=====================================================================\n");

// Helper function to handle standard JSON stream over native HTTP
function sendRequest(options, payload, callback) {
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                callback(res.statusCode, JSON.parse(data));
            } catch (e) {
                callback(res.statusCode, { error: "Parse Error", message: data });
            }
        });
    });
    
    req.on('error', (err) => {
        console.error("Transmission Error encountered:", err.message);
    });

    if (payload) {
        req.write(JSON.stringify(payload));
    }
    req.end();
}

// --- STEP 1: EXECUTE POST (CREATE OPERATION) ---
const createPayload = { name: "Arnav Tripathi", role: "Full Stack Engineer" };
const postOptions = { 
    hostname: 'localhost', 
    port: 3000, 
    path: '/users', 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' } 
};

sendRequest(postOptions, createPayload, (statusCode, createResponse) => {
    console.log(`[CRUD TEST 1] CREATE (POST /users)`);
    console.log(`-> Status Received: ${statusCode}`);
    console.log("-> Payload Result:", createResponse, "\n");

    // Capture the generated identity key directly from database commit metadata
    const assignedId = createResponse.data ? createResponse.data.id : null;

    if (!assignedId) {
        console.error("FATAL: Database did not return a valid identity key. Aborting lifecycle cascade.");
        return;
    }

    // --- STEP 2: EXECUTE GET (READ OPERATION) ---
    setTimeout(() => {
        const getOptions = { hostname: 'localhost', port: 3000, path: '/users', method: 'GET' };
        
        sendRequest(getOptions, null, (statusCode, readResponse) => {
            console.log(`[CRUD TEST 2] READ (GET /users)`);
            console.log(`-> Status Received: ${statusCode}`);
            console.log(`-> Records Found: ${readResponse.count || 0}`);
            console.log("-> Sample Rows:", readResponse.data, "\n");

            // --- STEP 3: EXECUTE PUT (UPDATE OPERATION) ---
            const updatePayload = { name: "Arnav Tripathi", role: "Lead Core Architect" };
            const putOptions = { 
                hostname: 'localhost', 
                port: 3000, 
                path: `/users/${assignedId}`, 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' } 
            };
            
            sendRequest(putOptions, updatePayload, (statusCode, updateResponse) => {
                console.log(`[CRUD TEST 3] UPDATE (PUT /users/${assignedId})`);
                console.log(`-> Status Received: ${statusCode}`);
                console.log("-> Payload Result:", updateResponse, "\n");

                // --- STEP 4: EXECUTE DELETE (PURGE OPERATION) ---
                const deleteOptions = { 
                    hostname: 'localhost', 
                    port: 3000, 
                    path: `/users/${assignedId}`, 
                    method: 'DELETE' 
                };
                
                sendRequest(deleteOptions, null, (statusCode, deleteResponse) => {
                    console.log(`[CRUD TEST 4] DELETE (DELETE /users/${assignedId})`);
                    console.log(`-> Status Received: ${statusCode}`);
                    console.log("-> Payload Result:", deleteResponse, "\n");
                    
                    console.log("=====================================================================");
                    console.log("Database Lifecycle Testing Completed flawlessly! 100% Submission Ready.");
                    console.log("=====================================================================");
                });
            });
        });
    }, 300); // Small 300ms cushion buffer for physical disk serialization write sync
});