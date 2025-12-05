"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const auth_1 = require("../../dist/middleware/auth");
// Simple session store for Netlify (in-memory, not persistent across invocations)
// Note: In production, consider using a proper session store like Redis
const sessions = new Map();
function getSessionId(cookies) {
    if (!cookies)
        return null;
    const match = cookies.match(/admin\.sid=([^;]+)/);
    return match ? match[1] : null;
}
const handler = async (event, context) => {
    const path = event.path.replace('/.netlify/functions/admin', '') || '/';
    const method = event.httpMethod;
    const cookies = event.headers.cookie || '';
    const sessionId = getSessionId(cookies);
    // Handle login
    if (method === 'POST' && path === '/login') {
        try {
            const { username, password } = JSON.parse(event.body || '{}');
            if (!username || !password) {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Username and password are required' }),
                };
            }
            const isValid = await (0, auth_1.checkCredentials)(username, password);
            if (isValid) {
                const newSessionId = `${Date.now()}-${Math.random()}`;
                sessions.set(newSessionId, { authenticated: true });
                const headers = {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `admin.sid=${newSessionId}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`,
                };
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true }),
                };
            }
            else {
                return {
                    statusCode: 401,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Invalid credentials' }),
                };
            }
        }
        catch (error) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Internal server error' }),
            };
        }
    }
    // Handle logout
    if (method === 'POST' && path === '/logout') {
        if (sessionId) {
            sessions.delete(sessionId);
        }
        const headers = {
            'Content-Type': 'application/json',
            'Set-Cookie': 'admin.sid=; HttpOnly; Path=/; Max-Age=0',
        };
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true }),
        };
    }
    // Handle check authentication
    if (method === 'GET' && path === '/check') {
        const session = sessionId ? sessions.get(sessionId) : null;
        const authenticated = session?.authenticated || false;
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authenticated }),
        };
    }
    // Serve admin panel HTML
    if (method === 'GET' && path === '/') {
        const fs = require('fs');
        const pathModule = require('path');
        try {
            const adminHtml = fs.readFileSync(pathModule.join(__dirname, '../../dist/public/admin.html'), 'utf8');
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'text/html' },
                body: adminHtml,
            };
        }
        catch (error) {
            // Fallback if file not found
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'text/html' },
                body: '<html><body><h1>Admin Panel</h1><p>Please ensure admin.html is in the public directory.</p></body></html>',
            };
        }
    }
    return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Not found' }),
    };
};
exports.handler = handler;
//# sourceMappingURL=admin.js.map