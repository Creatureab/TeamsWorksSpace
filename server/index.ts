import express from 'express';
import cors from 'cors';
import dbConnect from '../lib/mongodb';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Softwelve Notion Clone Backend is running!');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is healthy' });
});

// Example route for documents
app.get('/api/documents', async (req, res) => {
    try {
        // This is just a placeholder, you would normally fetch from DB
        res.json({ documents: [] });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start Server
const startServer = async () => {
    console.log('🔄 Starting server...');
    try {
        // Attempt DB connection but don't block server start if it fails (optional)
        // For now, let's try to connect
        await dbConnect().then(() => {
            console.log('✅ Connected to MongoDB');
        }).catch((err) => {
            console.error('⚠️ MongoDB connection failed, but server will start:', err.message);
        });

        app.listen(PORT, () => {
            console.log(`🚀 Express server is running on http://localhost:${PORT}`);
            console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Unexpected error during startup:', error);
    }
};

startServer();
