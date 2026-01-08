import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// TENOR CONFIG
const TENOR_API_KEY = process.env.TENOR_API_KEY || "L6V06SC3M06C";
const TENOR_CLIENT_KEY = "onuvuti_app";

app.get('/api/tenor/search', async (req, res) => {
  const { q, limit = 12 } = req.query;
  try {
    const response = await fetch(
      `https://tenor.googleapis.com/v2/search?q=${q}&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&limit=${limit}&contentfilter=medium`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Tenor' });
  }
});

app.get('/api/tenor/trending', async (req, res) => {
  const { limit = 12 } = req.query;
  try {
    const response = await fetch(
      `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&limit=${limit}&contentfilter=medium`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});

io.on('connection', (socket) => {
  console.log('👤 User Connected:', socket.id);

  socket.on('join_resonance', (data) => {
    // data: { roomId, profile: { impairments } }
    const { roomId, profile } = data;
    socket.join(roomId);
    console.log(`🌌 User ${socket.id} joined room: ${roomId}`);
    
    // Broadcast join with profile
    socket.to(roomId).emit('peer_joined', { id: socket.id, profile });
  });

  socket.on('send_signal', (data) => {
    socket.to(data.roomId).emit('receive_signal', data);
  });

  socket.on('disconnect', () => {
    console.log('👤 User Disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🌐 Resonance Server running on port ${PORT}`);
});
