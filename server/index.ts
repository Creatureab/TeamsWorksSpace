import express from 'express';
import next from 'next';
import cors from 'cors';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3001;

app.prepare().then(() => {
    const server = express();

    // Middleware
    server.use(cors());
    server.use(express.json());

    // API Routes
    server.get('/api/health', (req, res) => {
        res.json({ status: 'Server is running' });
    });

    // Handle all other routes with Next.js
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    // Start server
    server.listen(PORT, (err?: any) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});
