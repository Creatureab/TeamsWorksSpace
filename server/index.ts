import express from 'express';
import cors from 'cors';
import dbConnect from '../lib/mongodb';
import { WebSocketServer, WebSocket } from 'ws';
import { Workspace } from '../lib/model/workspace';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (_req, res) => {
  res.send('Softwelve Notion Clone Backend is running!');
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
});

// Example route for documents
app.get('/api/documents', async (_req, res) => {
  try {
    // This is just a placeholder, you would normally fetch from DB
    res.json({ documents: [] });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ───────── WebSocket Inbox Hub ─────────
type ClientMeta = { email: string; workspaceId?: string };
const clients = new Map<WebSocket, ClientMeta>();

const broadcastCounts = (workspaceId: string, emailCounts: Map<string, number>) => {
  for (const [ws, meta] of clients.entries()) {
    if (meta.workspaceId && meta.workspaceId !== workspaceId) continue;
    const count = emailCounts.get(meta.email);
    if (typeof count === 'number') {
      try {
        ws.send(JSON.stringify({ type: 'inbox', workspaceId, count }));
      } catch (err) {
        console.error('WS send error', err);
        clients.delete(ws);
        ws.close();
      }
    }
  }
};

const handleWorkspaceChange = (doc: any) => {
  if (!doc?._id || !Array.isArray(doc.pendingInvites)) return;
  const counts = new Map<string, number>();
  for (const inv of doc.pendingInvites) {
    if (!inv?.email) continue;
    const key = String(inv.email).toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  broadcastCounts(String(doc._id), counts);
};

// Start Server
const startServer = async () => {
  console.log('🔌 Starting server...');
  try {
    await dbConnect()
      .then(() => {
        console.log('✅ Connected to MongoDB');
      })
      .catch((err) => {
        console.error('⚠️ MongoDB connection failed, but server will start:', err.message);
      });

    const server = app.listen(PORT, () => {
      console.log(`🚀 Express server is running on http://localhost:${PORT}`);
      console.log(`📡 WS inbox: ws://localhost:${PORT}/ws/inbox`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });

    // WebSocket server
    const wss = new WebSocketServer({ server, path: '/ws/inbox' });

    wss.on('connection', (ws) => {
      console.log('WS connection opened');
      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(String(data));
          if (msg?.type === 'subscribe' && msg.email) {
            const meta: ClientMeta = {
              email: String(msg.email).toLowerCase(),
              workspaceId: msg.workspaceId ? String(msg.workspaceId) : undefined,
            };
            clients.set(ws, meta);
            ws.send(JSON.stringify({ type: 'subscribed', workspaceId: meta.workspaceId }));
          }
        } catch (err) {
          console.error('WS message parse error', err);
        }
      });

      ws.on('close', () => {
        clients.delete(ws);
        console.log('WS connection closed');
      });

      ws.on('error', () => {
        clients.delete(ws);
      });
    });

    // Mongo change stream for pendingInvites
    try {
      const changeStream = Workspace.watch([], { fullDocument: 'updateLookup' });
      changeStream.on('change', (change) => {
        if (
          change.operationType === 'insert' ||
          change.operationType === 'replace' ||
          change.operationType === 'update'
        ) {
          handleWorkspaceChange(change.fullDocument);
        }
      });
      changeStream.on('error', (err) => {
        console.error('Change stream error:', err);
      });
    } catch (err) {
      console.error('Unable to start change stream (requires replica set):', (err as Error).message);
    }
  } catch (error) {
    console.error('❌ Unexpected error during startup:', error);
  }
};

startServer();
