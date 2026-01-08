import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fetch from 'node-fetch';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Tenor API Proxy
const TENOR_KEY = 'LIVDSRZULELA'; // Public demo key
const CLIENT_KEY = 'my_test_app';

app.get('/api/tenor/search', async (req, res) => {
  const { q, limit = 9 } = req.query;
  try {
    const response = await fetch(
      `https://tenor.googleapis.com/v2/search?q=${q}&key=${TENOR_KEY}&client_key=${CLIENT_KEY}&limit=${limit}&media_filter=minimal`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Tenor error:', error);
    res.status(500).json({ error: 'Failed to fetch GIFs' });
  }
});

app.get('/api/tenor/trending', async (req, res) => {
  const { limit = 9 } = req.query;
  try {
    const response = await fetch(
      `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&client_key=${CLIENT_KEY}&limit=${limit}&media_filter=minimal`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Tenor error:', error);
    res.status(500).json({ error: 'Failed to fetch GIFs' });
  }
});

// Socket.IO Signaling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Example signaling
  socket.on('signal', (data) => {
    socket.broadcast.emit('signal', data);
  });
  
  socket.on('join-room', (roomId) => {
      socket.join(roomId);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
